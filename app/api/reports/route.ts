import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers and admins can access reports
    if (session.user.role === 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const customerId = searchParams.get('customerId');

    // Build where clause
    const where: any = {};
    
    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.date = { ...where.date, lte: end };
    }
    if (userId) {
      where.userId = userId;
    }
    if (customerId) {
      where.customers = {
        some: {
          customerId,
        },
      };
    }

    let reportData: any = {};

    if (type === 'user') {
      // Group by user
      const meetings = await prisma.meeting.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      const userMap = new Map<string, { userName: string | null; userEmail: string; count: number }>();
      
      meetings.forEach((meeting) => {
        const existing = userMap.get(meeting.userId);
        if (existing) {
          existing.count++;
        } else {
          userMap.set(meeting.userId, {
            userName: meeting.user.name,
            userEmail: meeting.user.email,
            count: 1,
          });
        }
      });

      reportData.byUser = Array.from(userMap.entries()).map(([userId, data]) => ({
        userId,
        ...data,
      })).sort((a, b) => b.count - a.count);

    } else if (type === 'customer') {
      // Group by customer
      const meetingCustomers = await prisma.meetingCustomer.findMany({
        where: {
          meeting: where,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const customerMap = new Map<string, { customerName: string; count: number }>();
      
      meetingCustomers.forEach((mc) => {
        const existing = customerMap.get(mc.customerId);
        if (existing) {
          existing.count++;
        } else {
          customerMap.set(mc.customerId, {
            customerName: mc.customer.name,
            count: 1,
          });
        }
      });

      reportData.byCustomer = Array.from(customerMap.entries()).map(([customerId, data]) => ({
        customerId,
        ...data,
      })).sort((a, b) => b.count - a.count);

    } else if (type === 'period') {
      // Group by month
      const meetings = await prisma.meeting.findMany({
        where,
        select: {
          date: true,
        },
      });

      const periodMap = new Map<string, number>();
      
      meetings.forEach((meeting) => {
        const date = new Date(meeting.date);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        periodMap.set(period, (periodMap.get(period) || 0) + 1);
      });

      reportData.byPeriod = Array.from(periodMap.entries())
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
