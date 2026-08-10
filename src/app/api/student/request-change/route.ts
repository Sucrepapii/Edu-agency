import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import { sendAgentChangeRequestedEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'STUDENT') {
      throw new ApiError('Only students can request agent changes.', 403);
    }

    const student = user.studentProfile;
    if (!student) {
      throw new ApiError('Student profile not found.', 404);
    }

    const { reason } = await request.json();
    if (!reason) {
      throw new ApiError('Reason for requesting change is required.', 400);
    }

    // Create request record
    const changeRequest = await prisma.agentChangeRequest.create({
      data: {
        studentId: student.id,
        agencyId: user.agencyId || '',
        currentAgentId: student.assignedAgentId,
        reason,
        status: 'PENDING',
      },
    });

    // Write Activity Log
    await prisma.activityLog.create({
      data: {
        agencyId: user.agencyId,
        studentId: student.id,
        userId: user.id,
        action: 'Agent Change Requested',
        description: `${user.name} requested to change their assigned agent.`,
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: { agencyId: user.agencyId, role: 'AGENCY_ADMIN' },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'AGENT_CHANGE_REQUEST',
          title: 'Agent Change Requested',
          message: `${user.name} has requested an agent change. Reason: "${reason.substring(0, 50)}..."`,
        },
      });

      // Send email notifications via Resend
      await sendAgentChangeRequestedEmail(admin.email, user.name, reason);
    }

    return NextResponse.json({ success: true, request: changeRequest });
  } catch (error: any) {
    return handleApiError(error);
  }
}
