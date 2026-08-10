import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        student: true,
      },
    });

    if (!document) {
      throw new ApiError('Document not found.', 404);
    }

    if (!document.fileUrl) {
      throw new ApiError('Document has no file associated with it.', 400);
    }

    // Role-based Access Control checks (backend security validation)
    let isAuthorized = false;

    if (user.role === 'SUPER_ADMIN') {
      isAuthorized = true;
    } else if (user.role === 'AGENCY_ADMIN') {
      // Must belong to the same agency
      if (user.agencyId === document.agencyId) {
        isAuthorized = true;
      }
    } else if (user.role === 'AGENT') {
      // Must be the assigned agent for the student
      if (user.agentProfile && document.student.assignedAgentId === user.agentProfile.id) {
        isAuthorized = true;
      }
    } else if (user.role === 'STUDENT') {
      // Must be the owner student of the document
      if (user.studentProfile && document.studentId === user.studentProfile.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new ApiError('Access Denied. You do not have permission to view this document.', 403);
    }

    // Serve local file or proxy remote file
    if (document.fileUrl.startsWith('/uploads/')) {
      const fileName = document.fileUrl.substring('/uploads/'.length);
      const filePath = path.join(process.cwd(), 'uploads', fileName);

      if (!fs.existsSync(filePath)) {
        throw new ApiError('Document file not found on server disk.', 404);
      }

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      // Basic mime type resolver
      let mimeType = 'application/octet-stream';
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.doc') mimeType = 'application/msword';
      else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename="${fileName}"`,
        },
      });
    } else {
      // Proxy Cloudinary file (secure streaming)
      const res = await fetch(document.fileUrl);
      if (!res.ok) {
        throw new ApiError('Failed to retrieve document from storage provider.', 502);
      }

      const arrayBuffer = await res.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const contentType = res.headers.get('content-type') || 'application/octet-stream';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${document.documentType}"`,
        },
      });
    }
  } catch (error: any) {
    return handleApiError(error);
  }
}
