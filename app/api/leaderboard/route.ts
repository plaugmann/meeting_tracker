import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'week'; // 'week' or 'month'

  const now = new Date();
  let startDate: Date;

  if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  try {
    // Get all meetings for the period
    const meetings = await prisma.meeting.findMany({
      where: {
        date: { gte: startDate },
      },
      select: {
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Count meetings per user
    const userCounts = meetings.reduce((acc, meeting) => {
      const userId = meeting.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          name: meeting.user.name || meeting.user.email,
          email: meeting.user.email,
          image: meeting.user.image,
          count: 0,
        };
      }
      acc[userId].count++;
      return acc;
    }, {} as Record<string, { userId: string; name: string; email: string; image: string | null; count: number }>);

    // Sort by count and take top 3
    const topUsers = Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return NextResponse.json(topUsers);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
