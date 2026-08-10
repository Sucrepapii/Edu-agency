import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, handleApiError, ApiError } from '@/lib/api-middleware';
import { sendApplicationSubmittedEmail } from '@/lib/resend';

// GET student's own application
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'STUDENT') {
      throw new ApiError('Only students can view applications via this endpoint.', 403);
    }

    const student = user.studentProfile;
    if (!student) {
      throw new ApiError('Student profile not found.', 404);
    }

    const application = await prisma.application.findUnique({
      where: { studentId: student.id },
      include: {
        documents: true,
      },
    });

    return NextResponse.json({ application });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// POST/PUT submit or update application
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (user.role !== 'STUDENT') {
      throw new ApiError('Only students can submit/update applications.', 403);
    }

    const student = user.studentProfile;
    if (!student) {
      throw new ApiError('Student profile not found.', 404);
    }

    const body = await request.json();
    const {
      // Personal
      fullName, dob, gender, nationality, phone, email, address,
      // Education
      highestQualification, institution, course, graduationYear, gpa,
      // Preferences
      prefCountry, prefSchool, prefCourse, prefIntake, budget,
      // Additional
      additionalInfo,
      // Flag to indicate final submission vs saving draft
      isSubmitted,
    } = body;

    const currentApp = await prisma.application.findUnique({
      where: { studentId: student.id },
    });

    if (!currentApp) {
      throw new ApiError('Application entry not initialized.', 404);
    }

    // Determine target stage
    let targetStatus = currentApp.status;
    let progressPercentage = currentApp.progressPercentage;

    if (isSubmitted && currentApp.status === 'SUBMITTED') {
      // Wait, is it unassigned? If the student has submitted, it stays in SUBMITTED but status transitions to awaiting assignment
      // Let's set target stage to SUBMITTED and keep progress percentage.
      // E.g. Stage 1 is SUBMITTED (progress 8%).
      targetStatus = 'SUBMITTED';
      progressPercentage = 8;
    }

    const updatedApp = await prisma.application.update({
      where: { studentId: student.id },
      data: {
        fullName, dob, gender, nationality, phone, email, address,
        highestQualification, institution, course, 
        graduationYear: graduationYear ? parseInt(graduationYear) : null, 
        gpa,
        prefCountry, prefSchool, prefCourse, prefIntake, budget,
        additionalInfo,
        status: targetStatus,
        progressPercentage,
      },
    });

    // If student finalized submission, log audits and notify admins/resend
    if (isSubmitted) {
      // Log audit
      await prisma.activityLog.create({
        data: {
          agencyId: user.agencyId,
          studentId: student.id,
          applicationId: updatedApp.id,
          userId: user.id,
          action: 'Application Submitted',
          description: `${user.name} submitted their multi-step application form.`,
        },
      });

      // Notify Agency Admins
      const admins = await prisma.user.findMany({
        where: { agencyId: user.agencyId, role: 'AGENCY_ADMIN' },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'NEW_APPLICATION',
            title: 'New Student Application',
            message: `${user.name} has submitted their application and is awaiting agent assignment.`,
          },
        });
      }

      // Send Email Notification
      await sendApplicationSubmittedEmail(user.email, user.name);
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error: any) {
    return handleApiError(error);
  }
}
