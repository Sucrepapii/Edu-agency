import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENT') {
      throw new ApiError('Unauthorized. Only agents can view the claim board.', 403);
    }

    const agencyId = user.agencyId;
    if (!agencyId) {
      throw new ApiError('Agent is not associated with any agency.', 400);
    }

    // Retrieve students who:
    // - belong to same agency
    // - have no assigned agent
    // - have submitted an application (application row exists)
    // Select only limited preview fields (no documents/sensitive personal info)
    const students = await prisma.student.findMany({
      where: {
        agencyId,
        assignedAgentId: null,
        assignmentStatus: 'UNASSIGNED',
        application: {
          isNot: null, // Application exists
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        application: {
          select: {
            id: true,
            prefCountry: true,
            prefCourse: true,
            prefIntake: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    return handleApiError(error);
  }
}
