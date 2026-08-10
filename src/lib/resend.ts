import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// General send email helper
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Education Platform <notifications@educationagency.com>',
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  } else {
    // Console log fallback for local testing without Resend API key
    console.log('\n--- [MOCK EMAIL SENT] ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:`);
    console.log(html.replace(/<[^>]*>/g, ' ').trim());
    console.log('-------------------------\n');
    return true;
  }
}

// Student registered / Application Submitted
export async function sendApplicationSubmittedEmail(studentEmail: string, studentName: string) {
  return sendEmail({
    to: studentEmail,
    subject: 'Application Received - Education Agency',
    html: `
      <h2>Hello ${studentName},</h2>
      <p>Thank you for submitting your application. It has entered our queue and is awaiting agent assignment.</p>
      <p>We will notify you as soon as an agent is assigned to your file.</p>
      <br/>
      <p>Best regards,<br/>Education Agency Team</p>
    `,
  });
}

// Agent Assigned Notification
export async function sendAgentAssignedEmail(
  studentEmail: string,
  studentName: string,
  agentEmail: string,
  agentName: string
) {
  // Email to Student
  await sendEmail({
    to: studentEmail,
    subject: 'Agent Assigned to Your Application',
    html: `
      <h2>Hello ${studentName},</h2>
      <p>Great news! <strong>${agentName}</strong> has been assigned as your dedicated education agent.</p>
      <p>You can now log into your dashboard to upload documents and message them directly.</p>
      <br/>
      <p>Best regards,<br/>Education Agency Team</p>
    `,
  });

  // Email to Agent
  await sendEmail({
    to: agentEmail,
    subject: 'New Student Assigned to You',
    html: `
      <h2>Hello ${agentName},</h2>
      <p>A new student, <strong>${studentName}</strong>, has been assigned to your roster.</p>
      <p>Please log in to review their application details and documents.</p>
      <br/>
      <p>Best regards,<br/>Education Agency Team</p>
    `,
  });
}

// Document Status Changed Email (Approved/Rejected/Resubmission Required)
export async function sendDocumentStatusChangedEmail(
  studentEmail: string,
  studentName: string,
  documentType: string,
  status: string,
  comment?: string
) {
  const commentSection = comment ? `<p><strong>Feedback comment:</strong> "${comment}"</p>` : '';
  await sendEmail({
    to: studentEmail,
    subject: `Document Update: ${documentType} is ${status}`,
    html: `
      <h2>Hello ${studentName},</h2>
      <p>Your document <strong>${documentType}</strong> status has been updated to <strong>${status}</strong>.</p>
      ${commentSection}
      <p>Please log in to your dashboard to review changes or perform any requested actions.</p>
      <br/>
      <p>Best regards,<br/>Education Agency Team</p>
    `,
  });
}

// Agent Change Request Email to Agency Admin
export async function sendAgentChangeRequestedEmail(
  adminEmail: string,
  studentName: string,
  reason: string
) {
  await sendEmail({
    to: adminEmail,
    subject: 'New Agent Change Request',
    html: `
      <h2>Hello Admin,</h2>
      <p>Student <strong>${studentName}</strong> has submitted a request to change their assigned education agent.</p>
      <p><strong>Reason for request:</strong></p>
      <blockquote>"${reason}"</blockquote>
      <p>Please log into the Admin Dashboard to review and action this request.</p>
      <br/>
      <p>Best regards,<br/>Education Agency Team</p>
    `,
  });
}

// Password Reset Email
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Hello ${name},</h2>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to set a new password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/>Education Agency Team</p>
    `,
  });
}
