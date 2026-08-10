import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError, checkTenant } from '@/lib/api-middleware';
import { sendAgentAssignedEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Only Administrators can assign agents.', 403);
    }

    const { studentId, agentId } = await request.json();
    if (!studentId || !agentId) {
      throw new ApiError('Student ID and Agent ID are required.', 400);
    }

    // Fetch student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new ApiError('Student not found.', 404);
    }

    // Verify tenant
    checkTenant(user, student.agencyId);

    // Fetch agent
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    if (!agent) {
      throw new ApiError('Agent not found.', 404);
    }

    // Verify agent is in the same agency
    if (agent.agencyId !== student.agencyId) {
      throw new ApiError('Cannot assign agent from a different agency.', 400);
    }

    const previousAgentId = student.assignedAgentId;

    // Update assignment
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        assignedAgentId: agent.id,
        assignmentStatus: 'ASSIGNED',
      },
    });

    // Update application
    await prisma.application.updateMany({
      where: { studentId: student.id },
      data: {
        assignedAgentId: agent.id,
        status: 'AGENT_ASSIGNED',
        progressPercentage: 16, // Stage 2: Agent Assigned
      },
    });

    // Determine if it was a reassignment or fresh assignment
    const isReassignment = !!previousAgentId && previousAgentId !== agent.id;
    const logAction = isReassignment ? 'Agent Reassigned' : 'Agent Assigned';
    const logDesc = isReassignment
      ? `${student.user.name} was reassigned to ${agent.user.name} by Admin ${user.name}.`
      : `${student.user.name} was assigned to ${agent.user.name} by Admin ${user.name}.`;

    // Log Activity (Section 35 Audit Logging)
    await prisma.activityLog.create({
      data: {
        agencyId: student.agencyId,
        studentId: student.id,
        userId: user.id,
        action: logAction,
        description: logDesc,
      },
    });

    // In-app Notifications
    // Notify student
    await prisma.notification.create({
      data: {
        userId: student.user.id,
        type: 'AGENT_ASSIGNED',
        title: 'Agent Assigned',
        message: `${agent.user.name} has been assigned as your agent by the administrator.`,
      },
    });

    // Notify new agent
    await prisma.notification.create({
      data: {
        userId: agent.user.id,
        type: 'STUDENT_ASSIGNED',
        title: 'New Student Assigned',
        message: `${student.user.name} has been assigned to you by the administrator.`,
      },
    });

    // If reassignment, notify the previous agent that they lost access
    if (isReassignment) {
      const prevAgent = await prisma.agent.findUnique({
        where: { id: previousAgentId },
      });
      if (prevAgent) {
        await prisma.notification.create({
          data: {
            userId: prevAgent.userId,
            type: 'STUDENT_REASSIGNED_AWAY',
            title: 'Student Reassigned',
            message: `${student.user.name} has been reassigned to another agent. You no longer have access.`,
          },
        });
      }
    }

    // Send emails
    await sendAgentAssignedEmail(
      student.user.email,
      student.user.name,
      agent.user.email,
      agent.user.name
    );

    return NextResponse.json({
      success: true,
      message: 'Student assigned successfully.',
      student: updatedStudent,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
