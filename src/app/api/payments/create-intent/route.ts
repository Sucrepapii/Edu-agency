import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'STUDENT') {
      throw new ApiError('Only students can initialize payments.', 403);
    }

    const { invoiceId } = await request.json();
    if (!invoiceId) {
      throw new ApiError('Invoice ID is required.', 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.studentId !== user.studentProfile?.id) {
      throw new ApiError('Invoice not found or access denied.', 404);
    }

    if (invoice.status === 'PAID') {
      throw new ApiError('Invoice is already paid.', 400);
    }

    // Paystack expects amount in the smallest currency unit (e.g. kobo for NGN)
    // Here we assume the amount in DB is in standard currency unit (e.g., NGN/USD) 
    // We multiply by 100 to pass to Paystack.
    const amountInKobo = Math.round(invoice.amount * 100);

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new ApiError('Payment gateway configuration is missing.', 500);
    }

    // Initialize transaction with Paystack API
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        metadata: {
          invoiceId: invoice.id,
          studentId: invoice.studentId,
        },
      }),
    });

    const data = await paystackRes.json();
    if (!paystackRes.ok) {
      console.error('Paystack Initialization Error:', data);
      throw new ApiError('Failed to initialize payment gateway.', 500);
    }

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        paystackRef: data.data.reference,
        status: 'PENDING',
      },
    });

    // Return the authorization url and reference so the client can redirect or use inline script
    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
