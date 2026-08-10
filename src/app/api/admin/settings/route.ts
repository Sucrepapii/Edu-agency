import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN') {
      throw new ApiError('Only Agency Admins can fetch settings.', 403);
    }

    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId || '' },
    });

    if (!agency) {
      throw new ApiError('Agency not found.', 404);
    }

    return NextResponse.json({ agency });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'AGENCY_ADMIN') {
      throw new ApiError('Only Agency Admins can update settings.', 403);
    }

    const body = await request.json();
    const { name, logo, description, email, phone, website, address, country, assignmentMode } = body;

    const agency = await prisma.agency.findUnique({
      where: { id: user.agencyId || '' },
    });

    if (!agency) {
      throw new ApiError('Agency not found.', 404);
    }

    const updatedAgency = await prisma.agency.update({
      where: { id: agency.id },
      data: {
        name: name !== undefined ? name : agency.name,
        logo: logo !== undefined ? logo : agency.logo,
        description: description !== undefined ? description : agency.description,
        email: email !== undefined ? email : agency.email,
        phone: phone !== undefined ? phone : agency.phone,
        website: website !== undefined ? website : agency.website,
        address: address !== undefined ? address : agency.address,
        country: country !== undefined ? country : agency.country,
        assignmentMode: assignmentMode !== undefined ? assignmentMode : agency.assignmentMode,
      },
    });

    // Log agency update activity
    await prisma.activityLog.create({
      data: {
        agencyId: agency.id,
        userId: user.id,
        action: 'Agency Settings Updated',
        description: `Agency settings updated by Admin ${user.name}.`,
      },
    });

    return NextResponse.json({ success: true, agency: updatedAgency });
  } catch (error: any) {
    return handleApiError(error);
  }
}
