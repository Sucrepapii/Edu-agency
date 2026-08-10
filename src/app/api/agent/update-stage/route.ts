import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError, checkAgentAssignment } from '@/lib/api-middleware';

const stageProgressMap: Record<string, number> = {
  SUBMITTED: 8,
  AGENT_ASSIGNED: 16,
  DOCUMENTS_REQUIRED: 25,
  DOCUMENTS_UNDER_REVIEW: 33,
  DOCUMENTS_APPROVED: 42,
  SCHOOL_SELECTION: 50,
  APPLICATION_SUBMITTED_TO_SCHOOL: 58,
  OFFER_RECEIVED: 67,
  ADMISSION_CONFIRMED: 75,
  VISA_PROCESSING: 83,
  VISA_APPROVED: 92,
  COMPLETED: 100,
};

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENT') {
      throw new ApiError('Only assigned agents can update application stages.', 403);
    }

    const { studentId, stage } = await request.json();
    if (!studentId || !stage) {
      throw new ApiError('Student ID and Stage are required.', 400);
    }

    // Verify stage name
    if (!(stage in stageProgressMap)) {
      throw new ApiError('Invalid application stage.', 400);
    }

    // Verify agent is assigned to student
    await checkAgentAssignment(user.id, studentId);

    // Get progress percentage
    const progressPercentage = stageProgressMap[stage];

    // Fetch student's user object for notifications
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new ApiError('Student not found.', 404);
    }

    // Update application stage
    const application = await prisma.application.update({
      where: { studentId },
      data: {
        status: stage,
        progressPercentage,
      },
    });

    const readableStageName = stage.toLowerCase().replace(/_/g, ' ');

    // Log Activity (Section 35 Audit Logging)
    await prisma.activityLog.create({
      data: {
        agencyId: user.agencyId,
        studentId,
        applicationId: application.id,
        userId: user.id,
        action: 'Stage Updated',
        description: `Updated application stage to: ${stage} (${progressPercentage}%).`,
      },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: student.user.id,
        type: 'STAGE_UPDATED',
        title: 'Application Progress Update',
        message: `Your application stage has been updated to: "${readableStageName}" (${progressPercentage}% complete).`,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return handleApiError(error);
  }
}
