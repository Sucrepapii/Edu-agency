import { NextResponse } from 'next/server';
import { getAuthUser, handleApiError } from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'AGENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await prisma.agent.findUnique({
      where: { userId: user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error('Error fetching agent profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'AGENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bio, specialization, position, profilePhoto } = body;

    const updatedAgent = await prisma.agent.update({
      where: { userId: user.id },
      data: {
        bio,
        specialization,
        position,
        ...(profilePhoto && { profilePhoto }),
      },
    });

    return NextResponse.json({ agent: updatedAgent });
  } catch (error: any) {
    console.error('Error updating agent profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
