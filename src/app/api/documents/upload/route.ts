import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import { uploadDocument } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'STUDENT') {
      throw new ApiError('Only students can upload documents.', 403);
    }

    const student = user.studentProfile;
    if (!student) {
      throw new ApiError('Student profile not found.', 404);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      throw new ApiError('File and Document Type are required.', 400);
    }

    // Validate size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new ApiError('File size exceeds 10MB limit.', 400);
    }

    // Validate type
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new ApiError('Unsupported file type. Only PDF, JPG, JPEG, PNG, DOC, and DOCX are allowed.', 400);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary/Local
    const fileUrl = await uploadDocument(buffer, file.name, file.type);

    // Check if document record already exists for this type
    const existingDoc = await prisma.document.findFirst({
      where: {
        studentId: student.id,
        documentType,
      },
    });

    let document;
    if (existingDoc) {
      document = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl,
          status: 'UNDER_REVIEW',
          uploadedAt: new Date().toISOString(),
          assignedAgentId: student.assignedAgentId,
        },
      });
    } else {
      document = await prisma.document.create({
        data: {
          studentId: student.id,
          agencyId: user.agencyId || '',
          documentType,
          fileUrl,
          status: 'UNDER_REVIEW',
          uploadedAt: new Date().toISOString(),
          assignedAgentId: student.assignedAgentId,
        },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        agencyId: user.agencyId,
        studentId: student.id,
        userId: user.id,
        action: 'Document Uploaded',
        description: `Uploaded document: ${documentType}`,
      },
    });

    // Notify assigned agent
    if (student.assignedAgentId) {
      const agentProfile = await prisma.agent.findUnique({
        where: { id: student.assignedAgentId },
      });
      if (agentProfile) {
        await prisma.notification.create({
          data: {
            userId: agentProfile.userId,
            type: 'DOCUMENT_UPLOADED',
            title: 'New Document Uploaded',
            message: `${user.name} uploaded their ${documentType} for review.`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    return handleApiError(error);
  }
}
