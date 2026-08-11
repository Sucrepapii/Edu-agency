import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.delete('auth-token');
      return res;
    }

    const session = await getSessionUser(token);
    if (!session) {
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.delete('auth-token');
      return res;
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
      const res = NextResponse.json({ user: null }, { status: 401 });
      res.cookies.delete('auth-token');
      return res;
    }

    // Clean up sensitive fields
    const { password, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    console.error('Me API Error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
