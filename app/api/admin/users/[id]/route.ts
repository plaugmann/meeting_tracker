import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, target } = body;

    // Validation
    if (!role || !['EMPLOYEE', 'MANAGER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (target === undefined || target < 1 || target > 100) {
      return NextResponse.json(
        { error: 'Target must be between 1 and 100' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        target,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        target: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
