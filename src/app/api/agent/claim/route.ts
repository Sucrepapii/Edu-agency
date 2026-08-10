import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import { sendAgentAssignedEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENT') {
      throw new ApiError('Only agents can claim students.', 403);
    }

    const agentProfile = user.agentProfile;
    if (!agentProfile) {
      throw new ApiError('Agent profile not found.', 404);
    }

    const { studentId } = await request.json();
    if (!studentId) {
      throw new ApiError('Student ID is required.', 400);
    }

    // Verify agency settings allow claiming
    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId || '' },
    });

    if (!agency) {
      throw new ApiError('Agency not found.', 404);
    }

    if (agency.assignmentMode !== 'ADMIN_AND_CLAIM') {
      throw new ApiError('Agent claiming is disabled for this agency. Only Admins can assign students.', 403);
    }

    // Perform atomic concurrency-protected update (Section 28 Concurrency Protection)
    const result = await prisma.student.updateMany({
      where: {
        id: studentId,
        agencyId: agency.id,
        assignmentStatus: 'UNASSIGNED',
        assignedAgentId: null,
      },
      data: {
        assignedAgentId: agentProfile.id,
        assignmentStatus: 'ASSIGNED',
      },
    });

    if (result.count === 0) {
      throw new ApiError('Sorry, this student has already been assigned to another agent.', 409);
    }

    // Claim succeeded. Now fetch the student details for logging and notifications
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new ApiError('Student not found after assignment.', 404);
    }

    // Also update application assigned agent
    await prisma.application.updateMany({
      where: { studentId: student.id },
      data: {
        assignedAgentId: agentProfile.id,
        status: 'AGENT_ASSIGNED',
        progressPercentage: 16, // Update progress to 16% (Stage 2: Agent Assigned)
      },
    });

    // Write Activity Log (Section 35 Audit Logging)
    await prisma.activityLog.create({
      data: {
        agencyId: agency.id,
        studentId: student.id,
        userId: user.id,
        action: 'Student Claimed',
        description: `${student.user.name} was claimed by Agent ${user.name}.`,
      },
    });

    // Send notifications to Student and Agent
    await prisma.notification.create({
      data: {
        userId: student.user.id,
        type: 'AGENT_ASSIGNED',
        title: 'Education Agent Assigned',
        message: `${user.name} has claimed your profile and will be managing your applications.`,
      },
    });

    // Notify agency admins
    const admins = await prisma.user.findMany({
      where: { agencyId: agency.id, role: 'AGENCY_ADMIN' },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'STUDENT_CLAIMED',
          title: 'Student Profile Claimed',
          message: `${student.user.name} was claimed by agent ${user.name}.`,
        },
      });
    }

    // Send Resend email notifications
    await sendAgentAssignedEmail(
      student.user.email,
      student.user.name,
      user.email,
      user.name
    );

    return NextResponse.json({
      success: true,
      message: 'Student claimed successfully.',
      student,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
