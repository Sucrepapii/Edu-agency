import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError, checkAgentAssignment } from '@/lib/api-middleware';
import { sendDocumentStatusChangedEmail } from '@/lib/resend';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENT') {
      throw new ApiError('Only agents can review documents.', 403);
    }

    const { id } = await params;
    const { status, comment } = await request.json();

    if (!status) {
      throw new ApiError('Status is required for review.', 400);
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!document) {
      throw new ApiError('Document not found.', 404);
    }

    // Verify assignment (security layer)
    await checkAgentAssignment(user.id, document.studentId);

    // Update document status
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        status,
        comment,
        reviewedAt: new Date().toISOString(),
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        agencyId: user.agencyId,
        studentId: document.studentId,
        userId: user.id,
        action: 'Document Reviewed',
        description: `Reviewed ${document.documentType}. Status: ${status}`,
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: document.student.userId,
        type: 'DOCUMENT_REVIEWED',
        title: `Document ${status.toLowerCase().replace('_', ' ')}`,
        message: `Your ${document.documentType} has been ${status.toLowerCase().replace('_', ' ')} by your agent.${
          comment ? ` Comment: "${comment}"` : ''
        }`,
      },
    });

    // Send email to student
    await sendDocumentStatusChangedEmail(
      document.student.user.email,
      document.student.user.name,
      document.documentType,
      status,
      comment
    );

    return NextResponse.json({ success: true, document: updatedDoc });
  } catch (error: any) {
    return handleApiError(error);
  }
}
