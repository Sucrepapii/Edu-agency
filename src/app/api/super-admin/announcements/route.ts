import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-middleware';

export async function GET() {
  try {
    const announcements = await prisma.platformAnnouncement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements', details: String(error.message || error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, message, isActive } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const announcement = await prisma.platformAnnouncement.create({
      data: {
        title,
        message,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
