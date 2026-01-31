import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    const customers = await prisma.customer.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
      take: 20, // Limit results for performance
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 }
    );
  }
}
