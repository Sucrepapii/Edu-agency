import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Unauthorized. Only Admins can list agents.', 403);
    }

    const agencyId = user.agencyId;
    if (!agencyId && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Agency not associated with Admin.', 400);
    }

    // Fetch agents (with users details and assigned students counts)
    const agents = await prisma.agent.findMany({
      where: agencyId ? { agencyId } : undefined,
      include: {
        user: true,
        students: {
          include: {
            user: true,
            application: true,
          },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Unauthorized. Only Admins can create agents.', 403);
    }

    const agencyId = user.agencyId;
    if (!agencyId && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Agency not associated with Admin.', 400);
    }

    const body = await request.json();
    const { name, email, phone, position, bio, specialization, profilePhoto, targetAgencyId } = body;

    const actualAgencyId = user.role === 'SUPER_ADMIN' ? targetAgencyId : agencyId;
    if (!actualAgencyId) {
      throw new ApiError('Agency ID is required.', 400);
    }

    if (!name || !email) {
      throw new ApiError('Name and Email are required.', 400);
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ApiError('A user with this email already exists.', 400);
    }

    // Generate random 8 character alphanumeric password
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(generatedPassword);

    // Create user with AGENT role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'AGENT',
        agencyId: actualAgencyId,
        forcePasswordChange: true,
      },
    });

    // Create Agent profile
    const agentProfile = await prisma.agent.create({
      data: {
        userId: newUser.id,
        agencyId: actualAgencyId,
        position,
        bio,
        specialization,
        profilePhoto,
        status: 'ACTIVE',
      },
    });

    // Log Activity (Section 35 Audit Logging)
    await prisma.activityLog.create({
      data: {
        agencyId: actualAgencyId,
        userId: user.id,
        action: 'Agent Account Created',
        description: `Created Agent account for ${name} (${email}).`,
      },
    });

    return NextResponse.json({
      success: true,
      agent: {
        ...agentProfile,
        user: newUser,
      },
      generatedPassword,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Unauthorized. Only Admins can modify agents.', 403);
    }

    const body = await request.json();
    const { agentId, name, phone, position, bio, specialization, profilePhoto, status } = body;

    if (!agentId) {
      throw new ApiError('Agent ID is required.', 400);
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    if (!agent) {
      throw new ApiError('Agent not found.', 404);
    }

    // Verify tenant
    if (user.role !== 'SUPER_ADMIN' && agent.agencyId !== user.agencyId) {
      throw new ApiError('Access Denied. Cannot edit agents from other agencies.', 403);
    }

    // Update User table details
    const updatedUser = await prisma.user.update({
      where: { id: agent.userId },
      data: {
        name: name !== undefined ? name : agent.user.name,
        phone: phone !== undefined ? phone : agent.user.phone,
      },
    });

    // Update Agent table details
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        position: position !== undefined ? position : agent.position,
        bio: bio !== undefined ? bio : agent.bio,
        specialization: specialization !== undefined ? specialization : agent.specialization,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : agent.profilePhoto,
        status: status !== undefined ? status : agent.status,
      },
    });

    // Log Activity (Section 35 Audit Logging)
    await prisma.activityLog.create({
      data: {
        agencyId: agent.agencyId,
        userId: user.id,
        action: 'Agent Account Updated',
        description: `Updated Agent profile details for ${updatedUser.name} (${status || 'No status change'}).`,
      },
    });

    return NextResponse.json({
      success: true,
      agent: {
        ...updatedAgent,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Unauthorized. Only Admins can delete agents.', 403);
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');

    if (!agentId) {
      throw new ApiError('Agent ID is required.', 400);
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });

    if (!agent) {
      throw new ApiError('Agent not found.', 404);
    }

    // Verify tenant
    if (user.role !== 'SUPER_ADMIN' && agent.agencyId !== user.agencyId) {
      throw new ApiError('Access Denied. Cannot delete agents from other agencies.', 403);
    }

    // Delete User (which cascades to Agent, AgentChangeRequest, ActivityLog if mapped properly, else delete agent first)
    // The schema specifies `Agent` has onDelete: Cascade for `user` relation. So deleting the user deletes the agent profile.
    await prisma.user.delete({
      where: { id: agent.userId },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        agencyId: agent.agencyId,
        userId: user.id,
        action: 'Agent Account Deleted',
        description: `Deleted Agent account for ${agent.user.name} (${agent.user.email}).`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
