import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-middleware';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await req.json();

    const announcement = await prisma.platformAnnouncement.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Failed to update announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.platformAnnouncement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
