import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const agencies = await prisma.agency.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        logo: true,
        country: true,
      },
    });

    return NextResponse.json({ agencies });
  } catch (error: any) {
    console.error('Public agencies fetch error:', error);
    return NextResponse.json({ agencies: [] });
  }
}
