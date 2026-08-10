import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    
    // Only agents can fetch their own student list
    if (user.role !== 'AGENT') {
      throw new ApiError('Unauthorized. Only Agents can access this route.', 403);
    }

    const agentProfile = user.agentProfile;
    if (!agentProfile) {
      throw new ApiError('Agent profile not found.', 404);
    }

    // Fetch students assigned to this agent
    const students = await prisma.student.findMany({
      where: { assignedAgentId: agentProfile.id },
      include: {
        user: true,
        application: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    return handleApiError(error);
  }
}
