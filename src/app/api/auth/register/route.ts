import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, password, country, dob, agencyId } = await request.json();

    if (!fullName || !email || !password || !agencyId) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Email, Password, Agency)' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Verify agency exists
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: 'Selected agency does not exist' },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and student profile in database
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        phone,
        password: hashedPassword,
        role: 'STUDENT',
        agencyId,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        agencyId,
        assignmentStatus: 'UNASSIGNED',
      },
    });

    // Create the draft/empty application
    await prisma.application.create({
      data: {
        studentId: student.id,
        agencyId,
        fullName,
        email,
        phone,
        prefCountry: country,
        dob,
        status: 'SUBMITTED', // Will complete form before transitioning to unassigned queue
        progressPercentage: 8,
      },
    });

    // Create default required documents for student
    // Agency Admin can configure these, but we initialize with standard list
    const defaultDocTypes = [
      'International Passport',
      'Academic Transcript',
      'Bank Statement',
      'CV',
    ];

    for (const docType of defaultDocTypes) {
      await prisma.document.create({
        data: {
          studentId: student.id,
          agencyId,
          documentType: docType,
          status: 'REQUIRED',
        },
      });
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        agencyId,
        studentId: student.id,
        userId: user.id,
        action: 'Student Registered',
        description: `${fullName} registered on the platform.`,
      },
    });

    // Generate Session JWT
    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      },
    });

    // Set HTTP-only Cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
