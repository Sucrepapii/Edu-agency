import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// GET all invoices for the authenticated user (Agency/Agent views their generated invoices, Student views theirs)
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    let invoices;

    if (user.role === 'STUDENT') {
      const studentProfile = user.studentProfile;
      if (!studentProfile) throw new ApiError('Student profile not found.', 404);
      invoices = await prisma.invoice.findMany({
        where: { studentId: studentProfile.id },
        include: { payments: true, agency: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'AGENCY_ADMIN' || user.role === 'AGENT') {
      invoices = await prisma.invoice.findMany({
        where: { agencyId: user.agencyId || '' },
        include: { student: { select: { id: true, user: { select: { name: true, email: true } } } }, payments: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      throw new ApiError('Unauthorized role', 403);
    }

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST create a new invoice (Agency/Agent only)
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'AGENT') {
      throw new ApiError('Only agents and admins can create invoices.', 403);
    }

    const { studentId, amount, description, dueDate } = await request.json();

    if (!studentId || !amount || amount <= 0) {
      throw new ApiError('Valid student ID and amount are required.', 400);
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        studentId,
        agencyId: user.agencyId || '',
        amount: parseFloat(amount),
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Notify the student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (student) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          type: 'NEW_INVOICE',
          title: 'New Invoice Issued',
          message: `An invoice for $${amount} has been issued to you: ${description || 'No description'}`,
        },
      });
    }

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error: any) {
    return handleApiError(error);
  }
}
