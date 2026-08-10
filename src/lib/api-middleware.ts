import { NextResponse } from 'next/server';
import { getSessionUser } from './auth';
import { prisma } from './prisma';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Get the logged in user from cookies and fetch fresh database record
export async function getAuthUser(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .find((c) => c.trim().startsWith('auth-token='))
    ?.split('=')[1];

  if (!token) {
    throw new ApiError('Unauthorized. Please log in.', 401);
  }

  const session = await getSessionUser(token);
  if (!session) {
    throw new ApiError('Unauthorized session.', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      agentProfile: true,
      studentProfile: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found.', 401);
  }

  return user;
}

// Ensure user belongs to the same agency (multi-tenant security)
export function checkTenant(user: any, agencyId: string) {
  if (user.role === 'SUPER_ADMIN') return; // Super admin can bypass agency restrictions
  if (user.agencyId !== agencyId) {
    throw new ApiError('Access Denied. Cross-tenant data access is prohibited.', 403);
  }
}

// Verify that an agent is assigned to a specific student
export async function checkAgentAssignment(agentUserId: string, studentId: string) {
  // Fetch agent profile
  const agent = await prisma.agent.findUnique({
    where: { userId: agentUserId },
  });

  if (!agent) {
    throw new ApiError('Agent profile not found.', 403);
  }

  // Fetch student
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError('Student not found.', 404);
  }

  // Check assignment
  if (student.assignedAgentId !== agent.id) {
    throw new ApiError('Access Denied. Student is not assigned to you.', 403);
  }

  return { agent, student };
}

// General error handler wrapper for API Routes
export function handleApiError(error: any) {
  console.error('API execution error:', error);
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  return NextResponse.json(
    { error: 'An unexpected error occurred on the server.' },
    { status: 500 }
  );
}
