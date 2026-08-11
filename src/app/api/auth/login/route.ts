import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and Password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify user profile is active (if agent/agency)
    if (user.role === 'AGENT') {
      const agentProfile = await prisma.agent.findUnique({
        where: { userId: user.id },
      });
      if (agentProfile?.status === 'INACTIVE') {
        return NextResponse.json(
          { error: 'Your agent account has been deactivated. Please contact your administrator.' },
          { status: 403 }
        );
      }
    }

    if (user.role === 'AGENCY_ADMIN') {
      const agency = await prisma.agency.findUnique({
        where: { id: user.agencyId || '' },
      });
      if (agency?.status === 'SUSPENDED') {
        return NextResponse.json(
          { error: 'Your agency has been suspended. Please contact platform support.' },
          { status: 403 }
        );
      }
    }

    // Generate Session JWT
    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        forcePasswordChange: user.forcePasswordChange,
      },
    });

    // Set Cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
