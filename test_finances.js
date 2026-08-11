const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const totalInvoices = await prisma.invoice.count();
    const paidInvoices = await prisma.invoice.count({ where: { status: 'PAID' } });
    const pendingInvoices = await prisma.invoice.count({ where: { status: 'PENDING' } });

    const paidAggregation = await prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });

    const invoices = await prisma.invoice.findMany({
      include: {
        agency: { select: { name: true } },
        student: { select: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    console.log("SUCCESS:", { totalInvoices, paidInvoices, paidAggregation, invoices });
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
