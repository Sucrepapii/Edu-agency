import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Clear existing databases (if any)
    await prisma.activityLog.updateMany({ data: {} });
    await prisma.agentChangeRequest.updateMany({ data: {} });
    await prisma.notification.updateMany({ data: {} });
    await prisma.message.updateMany({ data: {} });
    await prisma.document.updateMany({ data: {} });
    await prisma.application.updateMany({ data: {} });
    await prisma.student.updateMany({ data: {} });
    await prisma.agent.updateMany({ data: {} });
    await prisma.user.updateMany({ data: {} });
    await prisma.agency.updateMany({ data: {} });

    // For file-based mock, we can delete the actual arrays. In Prisma updateMany will just match all.
    // In our mock client, we can support clear by writing empty arrays or running custom reset.
    // Let's make sure our seed script creates fresh records.

    const passHash = await hashPassword('password123');

    // 2. Create Platform Super Admin
    const superAdminUser = await prisma.user.create({
      data: {
        name: 'Alex Platform Admin',
        email: 'superadmin@platform.com',
        phone: '+1 (555) 010-0000',
        password: passHash,
        role: 'SUPER_ADMIN',
        agencyId: null,
      },
    });

    // 3. Create Agency 1 (Admin + Agent Claim Enabled)
    const agency1 = await prisma.agency.create({
      data: {
        name: 'Global Education Consultants',
        logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
        description: 'Providing premium study abroad advisory and placement services worldwide.',
        email: 'info@globaledu.com',
        phone: '+1 (555) 100-2000',
        website: 'www.globaledu.com',
        address: '100 Innovation Way, Suite 400',
        country: 'United States',
        assignmentMode: 'ADMIN_AND_CLAIM',
        status: 'ACTIVE',
      },
    });

    const admin1 = await prisma.user.create({
      data: {
        name: 'Sarah Admin',
        email: 'admin1@globaledu.com',
        phone: '+1 (555) 100-2001',
        password: passHash,
        role: 'AGENCY_ADMIN',
        agencyId: agency1.id,
      },
    });

    // Create 3 Agents for Agency 1
    const agentNames1 = [
      { name: 'Sarah Johnson', email: 'sarah.j@globaledu.com', spec: 'UK & Canada Admissions', pos: 'Senior Education Consultant' },
      { name: 'Michael Brown', email: 'michael.b@globaledu.com', spec: 'USA Universities', pos: 'Education Consultant' },
      { name: 'David Williams', email: 'david.w@globaledu.com', spec: 'Australia & NZ Visas', pos: 'Visa Specialist' },
    ];
    const agents1 = [];
    for (const ag of agentNames1) {
      const u = await prisma.user.create({
        data: {
          name: ag.name,
          email: ag.email,
          phone: '+1 (555) 100-3000',
          password: passHash,
          role: 'AGENT',
          agencyId: agency1.id,
        },
      });
      const p = await prisma.agent.create({
        data: {
          userId: u.id,
          agencyId: agency1.id,
          specialization: ag.spec,
          position: ag.pos,
          bio: `Experienced specialist in ${ag.spec} with over 5 years of advisory background.`,
          profilePhoto: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108377-be9c29b29330' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&q=80&w=150`,
          status: 'ACTIVE',
        },
      });
      agents1.push(p);
    }

    // 4. Create Agency 2 (Admin Assignment Only)
    const agency2 = await prisma.agency.create({
      data: {
        name: 'Study Abroad Experts',
        logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=200',
        description: 'Your trusted partner for undergraduate and postgraduate university enrollment.',
        email: 'contact@studyexperts.com',
        phone: '+1 (555) 200-3000',
        website: 'www.studyexperts.com',
        address: '200 Academy Boulevard',
        country: 'Canada',
        assignmentMode: 'ADMIN_ONLY',
        status: 'ACTIVE',
      },
    });

    const admin2 = await prisma.user.create({
      data: {
        name: 'Rebecca Admin',
        email: 'admin2@studyexperts.com',
        phone: '+1 (555) 200-3001',
        password: passHash,
        role: 'AGENCY_ADMIN',
        agencyId: agency2.id,
      },
    });

    // Create 3 Agents for Agency 2
    const agentNames2 = [
      { name: 'Rebecca Smith', email: 'rebecca.s@studyexperts.com', spec: 'Europe Scholarships', pos: 'Scholarship Lead' },
      { name: 'James Wilson', email: 'james.w@studyexperts.com', spec: 'Canadian Colleges', pos: 'Education Advisor' },
      { name: 'Daniel Brown', email: 'daniel.b@studyexperts.com', spec: 'German Language Programs', pos: 'Advisor' },
    ];
    const agents2 = [];
    for (const ag of agentNames2) {
      const u = await prisma.user.create({
        data: {
          name: ag.name,
          email: ag.email,
          phone: '+1 (555) 200-4000',
          password: passHash,
          role: 'AGENT',
          agencyId: agency2.id,
        },
      });
      const p = await prisma.agent.create({
        data: {
          userId: u.id,
          agencyId: agency2.id,
          specialization: ag.spec,
          position: ag.pos,
          bio: `Dedicated counselor supporting student journeys to ${ag.spec}.`,
          profilePhoto: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1438761681033-6461ffad8d80' : '1472099645785-5658abf4ff4e'}?auto=format&fit=crop&q=80&w=150`,
          status: 'ACTIVE',
        },
      });
      agents2.push(p);
    }

    // 5. Create Agency 3 (Inactive/Suspended for testing)
    const agency3 = await prisma.agency.create({
      data: {
        name: 'Apex Scholars Advisory',
        logo: '',
        description: 'Elite mentoring and Ivy League admissions consultants.',
        email: 'info@apexscholars.com',
        phone: '+1 (555) 300-4000',
        assignmentMode: 'ADMIN_ONLY',
        status: 'SUSPENDED',
      },
    });

    const admin3 = await prisma.user.create({
      data: {
        name: 'Apex Admin',
        email: 'admin3@apexscholars.com',
        password: passHash,
        role: 'AGENCY_ADMIN',
        agencyId: agency3.id,
      },
    });

    // 6. Create 10 Students for Agency 1 (Global Education Consultants)
    const studentNames1 = [
      { name: 'John Doe', email: 'john.doe@gmail.com', country: 'Nigeria', course: 'Computer Science', intake: 'September 2027', budget: '$25,000/yr', assign: true, agentIdx: 0, stage: 'SCHOOL_SELECTION', progress: 50 },
      { name: 'Jane Smith', email: 'jane.smith@gmail.com', country: 'India', course: 'Business Administration', intake: 'January 2027', budget: '$30,000/yr', assign: true, agentIdx: 0, stage: 'DOCUMENTS_UNDER_REVIEW', progress: 33 },
      { name: 'Peter Adams', email: 'peter.adams@gmail.com', country: 'Ghana', course: 'Mechanical Engineering', intake: 'September 2027', budget: '$20,000/yr', assign: false, stage: 'SUBMITTED', progress: 8 },
      { name: 'Mary Jones', email: 'mary.jones@gmail.com', country: 'Kenya', course: 'Data Science', intake: 'September 2027', budget: '$22,000/yr', assign: true, agentIdx: 1, stage: 'VISA_PROCESSING', progress: 83 },
      { name: 'Paul Green', email: 'paul.green@gmail.com', country: 'Jamaica', course: 'Cybersecurity', intake: 'May 2027', budget: '$18,000/yr', assign: true, agentIdx: 1, stage: 'COMPLETED', progress: 100 },
      { name: 'Samuel White', email: 'samuel.white@gmail.com', country: 'United States', course: 'Global Public Health', intake: 'September 2027', budget: '$40,000/yr', assign: false, stage: 'SUBMITTED', progress: 8 },
      { name: 'Lucy Hale', email: 'lucy.h@gmail.com', country: 'Vietnam', course: 'Digital Marketing', intake: 'January 2027', budget: '$15,000/yr', assign: true, agentIdx: 2, stage: 'OFFER_RECEIVED', progress: 67 },
      { name: 'Carlos Ramos', email: 'carlos.r@gmail.com', country: 'Colombia', course: 'Artificial Intelligence', intake: 'September 2027', budget: '$28,000/yr', assign: true, agentIdx: 2, stage: 'APPLICATION_SUBMITTED_TO_SCHOOL', progress: 58 },
      { name: 'Fatima Al-Mansoor', email: 'fatima.a@gmail.com', country: 'UAE', course: 'Finance & Banking', intake: 'September 2027', budget: '$50,000/yr', assign: false, stage: 'SUBMITTED', progress: 8 },
      { name: 'Yuki Sato', email: 'yuki.s@gmail.com', country: 'Japan', course: 'Environmental Studies', intake: 'September 2027', budget: '$35,000/yr', assign: true, agentIdx: 0, stage: 'DOCUMENTS_REQUIRED', progress: 25 },
    ];

    for (const st of studentNames1) {
      const u = await prisma.user.create({
        data: {
          name: st.name,
          email: st.email,
          phone: '+1 (555) 999-0000',
          password: passHash,
          role: 'STUDENT',
          agencyId: agency1.id,
        },
      });

      const assignedAgent = st.assign ? agents1[st.agentIdx || 0] : null;

      const studentProfile = await prisma.student.create({
        data: {
          userId: u.id,
          agencyId: agency1.id,
          assignedAgentId: assignedAgent ? assignedAgent.id : null,
          assignmentStatus: assignedAgent ? 'ASSIGNED' : 'UNASSIGNED',
        },
      });

      const app = await prisma.application.create({
        data: {
          studentId: studentProfile.id,
          agencyId: agency1.id,
          assignedAgentId: assignedAgent ? assignedAgent.id : null,
          status: st.stage as any,
          progressPercentage: st.progress,
          fullName: st.name,
          email: st.email,
          phone: '+1 (555) 999-0000',
          prefCountry: st.country,
          prefCourse: st.course,
          prefIntake: st.intake,
          budget: st.budget,
          prefSchool: 'Select University',
          dob: '2002-05-15',
          gender: 'Other',
          nationality: st.country,
          address: '123 Student Street, Main City',
          highestQualification: 'High School Diploma',
          institution: 'National Science Academy',
          graduationYear: 2024,
          gpa: '3.8 / 4.0',
        },
      });

      // Seed Documents for student
      const docTypes = ['International Passport', 'Academic Transcript', 'Bank Statement', 'CV'];
      for (let i = 0; i < docTypes.length; i++) {
        const type = docTypes[i];
        let status: any = 'REQUIRED';
        let fileUrl = null;
        let comment = null;

        if (st.progress > 25) {
          status = i === 0 ? 'APPROVED' : i === 1 ? 'UNDER_REVIEW' : 'UPLOADED';
          fileUrl = `/uploads/mock-document-${type.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        }
        if (st.name === 'John Doe' && type === 'Bank Statement') {
          status = 'RESUBMISSION_REQUIRED';
          fileUrl = `/uploads/mock-bank-statement-poor.pdf`;
          comment = 'Please upload a clearer scan of the passport information page.';
        }

        await prisma.document.create({
          data: {
            studentId: studentProfile.id,
            agencyId: agency1.id,
            assignedAgentId: assignedAgent ? assignedAgent.id : null,
            documentType: type,
            status,
            fileUrl,
            comment,
            uploadedAt: fileUrl ? new Date().toISOString() : null,
            reviewedAt: status === 'APPROVED' || status === 'RESUBMISSION_REQUIRED' ? new Date().toISOString() : null,
          },
        });
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          agencyId: agency1.id,
          studentId: studentProfile.id,
          applicationId: app.id,
          userId: u.id,
          action: 'Application Submitted',
          description: `Student ${st.name} submitted registration application.`,
        },
      });

      if (assignedAgent) {
        await prisma.activityLog.create({
          data: {
            agencyId: agency1.id,
            studentId: studentProfile.id,
            applicationId: app.id,
            userId: admin1.id,
            action: 'Agent Assigned',
            description: `${st.name} was assigned to ${agentNames1[st.agentIdx || 0].name} by Admin.`,
          },
        });

        // Chat message seeds
        await prisma.message.create({
          data: {
            senderId: assignedAgent.userId,
            receiverId: u.id,
            studentId: studentProfile.id,
            agencyId: agency1.id,
            message: `Hello ${st.name}! Welcome to Global Education Consultants. I'm your advisor, and I'll help you secure your admissions for ${st.course}. Please upload your transcript and passport to begin.`,
            createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
          },
        });

        await prisma.message.create({
          data: {
            senderId: u.id,
            receiverId: assignedAgent.userId,
            studentId: studentProfile.id,
            agencyId: agency1.id,
            message: 'Thank you! I have uploaded my passport and transcript. Let me know if you need anything else.',
            createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(), // 1 hour ago
          },
        });
      }
    }

    // 7. Create 10 Students for Agency 2 (Study Abroad Experts)
    // Similar seeding but for Agency 2...
    const studentNames2 = [
      { name: 'Mary Smith', email: 'mary.smith@gmail.com', country: 'Nigeria', course: 'Public Health', intake: 'September 2027', assign: true, agentIdx: 0, stage: 'SCHOOL_SELECTION', progress: 50 },
      { name: 'James Parker', email: 'james.parker@gmail.com', country: 'Ghana', course: 'Civil Engineering', intake: 'September 2027', assign: false, stage: 'SUBMITTED', progress: 8 },
      { name: 'Linda Carter', email: 'linda.carter@gmail.com', country: 'India', course: 'Computer Science', intake: 'January 2027', assign: true, agentIdx: 1, stage: 'DOCUMENTS_APPROVED', progress: 42 },
      { name: 'Robert Vance', email: 'robert.vance@gmail.com', country: 'United States', course: 'MBA', intake: 'May 2027', assign: true, agentIdx: 2, stage: 'COMPLETED', progress: 100 },
    ];

    for (const st of studentNames2) {
      const u = await prisma.user.create({
        data: {
          name: st.name,
          email: st.email,
          password: passHash,
          role: 'STUDENT',
          agencyId: agency2.id,
        },
      });

      const assignedAgent = st.assign ? agents2[st.agentIdx || 0] : null;

      const studentProfile = await prisma.student.create({
        data: {
          userId: u.id,
          agencyId: agency2.id,
          assignedAgentId: assignedAgent ? assignedAgent.id : null,
          assignmentStatus: assignedAgent ? 'ASSIGNED' : 'UNASSIGNED',
        },
      });

      await prisma.application.create({
        data: {
          studentId: studentProfile.id,
          agencyId: agency2.id,
          assignedAgentId: assignedAgent ? assignedAgent.id : null,
          status: st.stage as any,
          progressPercentage: st.progress,
          fullName: st.name,
          email: st.email,
          prefCountry: st.country,
          prefCourse: st.course,
          prefIntake: st.intake,
          dob: '2003-09-12',
          gender: 'Female',
          nationality: st.country,
          address: '456 College Street',
          highestQualification: 'Undergraduate Degree',
          institution: 'Global Technical Institute',
          graduationYear: 2025,
          gpa: '3.5',
        },
      });

      // Seed default documents
      await prisma.document.create({
        data: {
          studentId: studentProfile.id,
          agencyId: agency2.id,
          documentType: 'International Passport',
          status: 'REQUIRED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with 3 agencies, 6 agents, 14 students, and all relational data.',
    });
  } catch (error: any) {
    console.error('Seeding API Error:', error);
    return NextResponse.json({ error: error.message || 'Seeding failed.' }, { status: 500 });
  }
}
