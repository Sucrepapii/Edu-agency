import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      throw new ApiError('Password must be at least 6 characters long.', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        forcePasswordChange: false,
      },
    });

    // Optional: Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        agencyId: user.agencyId,
        action: 'Password Changed',
        description: 'User successfully updated their auto-generated password.',
      },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return handleApiError(error);
  }
}
