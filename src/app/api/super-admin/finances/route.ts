import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-middleware';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Aggregate Invoices
    const invoices = await prisma.invoice.findMany({
      include: {
        agency: { select: { name: true } },
        student: { select: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit for performance
    });

    const totalInvoices = await prisma.invoice.count();
    const paidInvoices = await prisma.invoice.count({ where: { status: 'PAID' } });
    const pendingInvoices = await prisma.invoice.count({ where: { status: 'PENDING' } });

    // Calculate total revenue (sum of all PAID invoices)
    const paidAggregation = await prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });
    
    const pendingAggregation = await prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'PENDING' },
    });

    const totalRevenue = paidAggregation._sum.amount || 0;
    const pendingRevenue = pendingAggregation._sum.amount || 0;

    return NextResponse.json({
      metrics: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalRevenue,
        pendingRevenue,
      },
      recentInvoices: invoices,
    });
  } catch (error) {
    console.error('Failed to fetch financial data:', error);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}
