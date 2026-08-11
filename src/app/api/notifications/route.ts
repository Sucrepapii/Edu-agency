import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          read: true,
        },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: {
          read: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
