import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
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
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check permissions
    if (meeting.userId !== session.user.id && session.user.role === 'EMPLOYEE') {
      return NextResponse.json(
        { error: 'Forbidden: Cannot view other users meetings' },
        { status: 403 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check ownership
    if (meeting.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Can only edit your own meetings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { date, customerIds, externalParticipants, description } = body;

    // Delete existing customer relationships and create new ones
    await prisma.meetingCustomer.deleteMany({
      where: { meetingId: id },
    });

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        externalParticipants,
        description,
        customers: customerIds
          ? {
              create: customerIds.map((customerId: string) => ({
                customerId,
              })),
            }
          : undefined,
      },
      include: {
        customers: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check ownership
    if (meeting.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Can only delete your own meetings' },
        { status: 403 }
      );
    }

    await prisma.meeting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
