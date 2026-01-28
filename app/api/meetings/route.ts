import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Check permissions
    if (userId !== session.user.id && session.user.role === 'EMPLOYEE') {
      return NextResponse.json(
        { error: 'Forbidden: Cannot view other users meetings' },
        { status: 403 }
      );
    }

    const meetings = await prisma.meeting.findMany({
      where: { userId },
      include: {
        customers: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, customerIds, externalParticipants, description } = body;

    // Validation
    if (!date || !customerIds || customerIds.length === 0 || !externalParticipants) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create meeting with customer relationships
    const meeting = await prisma.meeting.create({
      data: {
        date: new Date(date),
        externalParticipants,
        description: description || '',
        userId: session.user.id,
        customers: {
          create: customerIds.map((customerId: string) => ({
            customerId,
          })),
        },
      },
      include: {
        customers: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
