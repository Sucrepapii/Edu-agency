import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-middleware';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            students: true,
            agents: true,
            applications: true,
            users: true,
          }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error('Failed to fetch agency details:', error);
    return NextResponse.json({ error: 'Failed to fetch agency details' }, { status: 500 });
  }
}
