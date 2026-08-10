import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError, checkAgentAssignment } from '@/lib/api-middleware';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const targetStudentId = searchParams.get('studentId');

    let studentId = '';
    let agentId = '';

    if (user.role === 'STUDENT') {
      const studentProfile = user.studentProfile;
      if (!studentProfile) throw new ApiError('Student profile not found.', 404);
      studentId = studentProfile.id;
      
      if (!studentProfile.assignedAgentId) {
        return NextResponse.json({ messages: [], info: 'No agent assigned yet.' });
      }
      agentId = studentProfile.assignedAgentId;
    } else if (user.role === 'AGENT') {
      if (!targetStudentId) {
        throw new ApiError('Student ID parameter is required for agents.', 400);
      }
      studentId = targetStudentId;
      
      // Verify agent-student assignment
      const { agent } = await checkAgentAssignment(user.id, targetStudentId);
      agentId = agent.id;
    } else if (user.role === 'AGENCY_ADMIN') {
      if (!targetStudentId) {
        throw new ApiError('Student ID parameter is required for admins.', 400);
      }
      studentId = targetStudentId;

      // Verify student belongs to the admin's agency
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });
      if (!student || student.agencyId !== user.agencyId) {
        throw new ApiError('Access Denied. Student belongs to another agency.', 403);
      }
    } else {
      throw new ApiError('Access Denied.', 403);
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        studentId,
        agencyId: user.agencyId || '',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark received messages as read
    if (user.role === 'STUDENT' || user.role === 'AGENT') {
      await prisma.message.updateMany({
        where: {
          studentId,
          receiverId: user.id,
          readAt: null,
        },
        data: {
          readAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ messages });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const { message, attachmentUrl, targetStudentId } = body;

    if (!message && !attachmentUrl) {
      throw new ApiError('Message text or attachment is required.', 400);
    }

    let studentId = '';
    let receiverId = '';
    let agentId = '';

    if (user.role === 'STUDENT') {
      const studentProfile = user.studentProfile;
      if (!studentProfile) throw new ApiError('Student profile not found.', 404);
      if (!studentProfile.assignedAgentId) {
        throw new ApiError('Cannot send message. No agent assigned yet.', 400);
      }
      studentId = studentProfile.id;
      agentId = studentProfile.assignedAgentId;

      // Find agent's user ID to set as receiver
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
      });
      if (!agent) throw new ApiError('Agent profile not found.', 404);
      receiverId = agent.userId;
    } else if (user.role === 'AGENT') {
      if (!targetStudentId) {
        throw new ApiError('Target Student ID is required for agents.', 400);
      }
      studentId = targetStudentId;
      
      const { agent, student } = await checkAgentAssignment(user.id, targetStudentId);
      agentId = agent.id;
      receiverId = student.userId;
    } else {
      throw new ApiError('Only students and assigned agents can send messages.', 403);
    }

    // Save message
    const newMessage = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        studentId,
        agencyId: user.agencyId || '',
        message: message || '',
        attachmentUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Create in-app notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New Message Received',
        message: `You have a new message from ${user.name}: "${
          message ? (message.length > 40 ? `${message.substring(0, 40)}...` : message) : 'Sent an attachment'
        }"`,
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return handleApiError(error);
  }
}
