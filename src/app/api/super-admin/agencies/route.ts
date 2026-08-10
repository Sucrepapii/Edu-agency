import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Access Denied. Only platform super admins allowed.', 403);
    }

    const agencies = await prisma.agency.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ agencies });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Access Denied. Only platform super admins allowed.', 403);
    }

    const body = await request.json();
    const { name, logo, description, email, phone, website, address, country, assignmentMode } = body;

    if (!name) {
      throw new ApiError('Agency name is required.', 400);
    }

    const agency = await prisma.agency.create({
      data: {
        name,
        logo,
        description,
        email,
        phone,
        website,
        address,
        country,
        assignmentMode: assignmentMode || 'ADMIN_ONLY',
        status: 'ACTIVE',
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'Agency Created',
        description: `Platform Super Admin created agency: ${name}.`,
      },
    });

    return NextResponse.json({ success: true, agency });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'SUPER_ADMIN') {
      throw new ApiError('Access Denied. Only platform super admins allowed.', 403);
    }

    const body = await request.json();
    const { id, name, description, status, assignmentMode } = body;

    if (!id) {
      throw new ApiError('Agency ID is required.', 400);
    }

    const agency = await prisma.agency.findUnique({
      where: { id },
    });

    if (!agency) {
      throw new ApiError('Agency not found.', 404);
    }

    const updated = await prisma.agency.update({
      where: { id },
      data: {
        name: name !== undefined ? name : agency.name,
        description: description !== undefined ? description : agency.description,
        status: status !== undefined ? status : agency.status,
        assignmentMode: assignmentMode !== undefined ? assignmentMode : agency.assignmentMode,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'Agency Updated',
        description: `Platform Super Admin updated agency: ${agency.name}. Status: ${status || 'No status change'}.`,
      },
    });

    return NextResponse.json({ success: true, agency: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
