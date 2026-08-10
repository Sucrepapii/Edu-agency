import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get cookies from request headers
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('auth-token='));
    const token = tokenCookie
      ? tokenCookie.trim().substring('auth-token='.length)
      : undefined;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const session = await getSessionUser(token);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Fetch fresh user profile from DB to ensure no stale data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        agency: true,
        agentProfile: true,
        studentProfile: {
          include: {
            assignedAgent: {
              include: {
                user: true
              }
            },
            application: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Clean up sensitive fields
    const { password, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    console.error('Me API Error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
