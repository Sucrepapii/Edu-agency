const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'db.json');

async function seed() {
  console.log('Seeding local file-based database...');

  const passHash = await bcrypt.hash('password123', 10);

  const db = {
    agencies: [
      {
        id: 'agency-1',
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
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agency-2',
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
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agency-3',
        name: 'Apex Scholars Advisory',
        logo: '',
        description: 'Elite mentoring and Ivy League admissions consultants.',
        email: 'info@apexscholars.com',
        phone: '+1 (555) 300-4000',
        assignmentMode: 'ADMIN_ONLY',
        status: 'SUSPENDED',
        createdAt: new Date().toISOString(),
      }
    ],
    users: [
      {
        id: 'user-superadmin',
        name: 'Alex Platform Admin',
        email: 'superadmin@platform.com',
        phone: '+1 (555) 010-0000',
        password: passHash,
        role: 'SUPER_ADMIN',
        agencyId: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-admin1',
        name: 'Sarah Admin',
        email: 'admin1@globaledu.com',
        phone: '+1 (555) 100-2001',
        password: passHash,
        role: 'AGENCY_ADMIN',
        agencyId: 'agency-1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-admin2',
        name: 'Rebecca Admin',
        email: 'admin2@studyexperts.com',
        phone: '+1 (555) 200-3001',
        password: passHash,
        role: 'AGENCY_ADMIN',
        agencyId: 'agency-2',
        createdAt: new Date().toISOString(),
      },
      // Agency 1 Agents
      {
        id: 'user-agent1',
        name: 'Sarah Johnson',
        email: 'sarah.j@globaledu.com',
        phone: '+1 (555) 100-3001',
        password: passHash,
        role: 'AGENT',
        agencyId: 'agency-1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-agent2',
        name: 'Michael Brown',
        email: 'michael.b@globaledu.com',
        phone: '+1 (555) 100-3002',
        password: passHash,
        role: 'AGENT',
        agencyId: 'agency-1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-agent3',
        name: 'David Williams',
        email: 'david.w@globaledu.com',
        phone: '+1 (555) 100-3003',
        password: passHash,
        role: 'AGENT',
        agencyId: 'agency-1',
        createdAt: new Date().toISOString(),
      },
      // Agency 2 Agents
      {
        id: 'user-agent4',
        name: 'Rebecca Smith',
        email: 'rebecca.s@studyexperts.com',
        phone: '+1 (555) 200-4001',
        password: passHash,
        role: 'AGENT',
        agencyId: 'agency-2',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-agent5',
        name: 'James Wilson',
        email: 'james.w@studyexperts.com',
        phone: '+1 (555) 200-4002',
        password: passHash,
        role: 'AGENT',
        agencyId: 'agency-2',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-agent6',
        name: 'Daniel Brown',
        email: 'daniel.b@studyexperts.com',
        phone: '+1 (555) 200-4003',
        password: passHash,
        role: 'AGENT',
        agencyId: 'agency-2',
        createdAt: new Date().toISOString(),
      }
    ],
    agents: [
      {
        id: 'agent-1',
        userId: 'user-agent1',
        agencyId: 'agency-1',
        specialization: 'UK & Canada Admissions',
        position: 'Senior Education Consultant',
        bio: 'Experienced specialist in UK and Canada admissions with over 5 years of advisory background.',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agent-2',
        userId: 'user-agent2',
        agencyId: 'agency-1',
        specialization: 'USA Universities',
        position: 'Education Consultant',
        bio: 'Admissions helper for USA Tier-1 and Ivy League schools.',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agent-3',
        userId: 'user-agent3',
        agencyId: 'agency-1',
        specialization: 'Australia & NZ Visas',
        position: 'Visa Specialist',
        bio: 'Certified immigration advisor with extensive expertise in Australian student visas.',
        profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agent-4',
        userId: 'user-agent4',
        agencyId: 'agency-2',
        specialization: 'Europe Scholarships',
        position: 'Scholarship Lead',
        bio: 'Dedicated counselor supporting European university scholarship applications.',
        profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agent-5',
        userId: 'user-agent5',
        agencyId: 'agency-2',
        specialization: 'Canadian Colleges',
        position: 'Education Advisor',
        bio: 'Focuses on Ontario college admissions and post-study work permits.',
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'agent-6',
        userId: 'user-agent6',
        agencyId: 'agency-2',
        specialization: 'German Language Programs',
        position: 'Advisor',
        bio: 'Helps students prepare for German public universities and language pre-reqs.',
        profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      }
    ],
    students: [],
    applications: [],
    documents: [],
    messages: [],
    notifications: [],
    activityLogs: [],
    agentChangeRequests: []
  };

  // Add Students for Agency 1
  const studentNames1 = [
    { id: 'student-1', uId: 'user-stud1', name: 'John Doe', email: 'john.doe@gmail.com', country: 'Nigeria', course: 'Computer Science', intake: 'September 2027', budget: '$25,000/yr', assign: true, agentId: 'agent-1', stage: 'SCHOOL_SELECTION', progress: 50 },
    { id: 'student-2', uId: 'user-stud2', name: 'Jane Smith', email: 'jane.smith@gmail.com', country: 'India', course: 'Business Administration', intake: 'January 2027', budget: '$30,000/yr', assign: true, agentId: 'agent-1', stage: 'DOCUMENTS_UNDER_REVIEW', progress: 33 },
    { id: 'student-3', uId: 'user-stud3', name: 'Peter Adams', email: 'peter.adams@gmail.com', country: 'Ghana', course: 'Mechanical Engineering', intake: 'September 2027', budget: '$20,000/yr', assign: false, stage: 'SUBMITTED', progress: 8 },
    { id: 'student-4', uId: 'user-stud4', name: 'Mary Jones', email: 'mary.jones@gmail.com', country: 'Kenya', course: 'Data Science', intake: 'September 2027', budget: '$22,000/yr', assign: true, agentId: 'agent-2', stage: 'VISA_PROCESSING', progress: 83 },
    { id: 'student-5', uId: 'user-stud5', name: 'Paul Green', email: 'paul.green@gmail.com', country: 'Jamaica', course: 'Cybersecurity', intake: 'May 2027', budget: '$18,000/yr', assign: true, agentId: 'agent-2', stage: 'COMPLETED', progress: 100 },
    { id: 'student-6', uId: 'user-stud6', name: 'Samuel White', email: 'samuel.white@gmail.com', country: 'United States', course: 'Global Public Health', intake: 'September 2027', budget: '$40,000/yr', assign: false, stage: 'SUBMITTED', progress: 8 },
    { id: 'student-7', uId: 'user-stud7', name: 'Lucy Hale', email: 'lucy.h@gmail.com', country: 'Vietnam', course: 'Digital Marketing', intake: 'January 2027', budget: '$15,000/yr', assign: true, agentId: 'agent-3', stage: 'OFFER_RECEIVED', progress: 67 },
    { id: 'student-8', uId: 'user-stud8', name: 'Carlos Ramos', email: 'carlos.r@gmail.com', country: 'Colombia', course: 'Artificial Intelligence', intake: 'September 2027', budget: '$28,000/yr', assign: true, agentId: 'agent-3', stage: 'APPLICATION_SUBMITTED_TO_SCHOOL', progress: 58 },
    { id: 'student-9', uId: 'user-stud9', name: 'Fatima Al-Mansoor', email: 'fatima.a@gmail.com', country: 'UAE', course: 'Finance & Banking', intake: 'September 2027', budget: '$50,000/yr', assign: false, stage: 'SUBMITTED', progress: 8 },
    { id: 'student-10', uId: 'user-stud10', name: 'Yuki Sato', email: 'yuki.s@gmail.com', country: 'Japan', course: 'Environmental Studies', intake: 'September 2027', budget: '$35,000/yr', assign: true, agentId: 'agent-1', stage: 'DOCUMENTS_REQUIRED', progress: 25 },
  ];

  for (const st of studentNames1) {
    db.users.push({
      id: st.uId,
      name: st.name,
      email: st.email,
      phone: '+1 (555) 999-0000',
      password: passHash,
      role: 'STUDENT',
      agencyId: 'agency-1',
      createdAt: new Date().toISOString(),
    });

    db.students.push({
      id: st.id,
      userId: st.uId,
      agencyId: 'agency-1',
      assignedAgentId: st.assign ? st.agentId : null,
      assignmentStatus: st.assign ? 'ASSIGNED' : 'UNASSIGNED',
      createdAt: new Date().toISOString(),
    });

    db.applications.push({
      id: `app-${st.id}`,
      studentId: st.id,
      agencyId: 'agency-1',
      assignedAgentId: st.assign ? st.agentId : null,
      status: st.stage,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Documents
    const docTypes = ['International Passport', 'Academic Transcript', 'Bank Statement', 'CV'];
    for (let i = 0; i < docTypes.length; i++) {
      const type = docTypes[i];
      let status = 'REQUIRED';
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

      db.documents.push({
        id: `doc-${st.id}-${i}`,
        studentId: st.id,
        applicationId: `app-${st.id}`,
        agencyId: 'agency-1',
        assignedAgentId: st.assign ? st.agentId : null,
        documentType: type,
        status,
        fileUrl,
        comment,
        uploadedAt: fileUrl ? new Date().toISOString() : null,
        reviewedAt: status === 'APPROVED' || status === 'RESUBMISSION_REQUIRED' ? new Date().toISOString() : null,
      });
    }

    // Activity Log
    db.activityLogs.push({
      id: `log-${st.id}-1`,
      agencyId: 'agency-1',
      studentId: st.id,
      applicationId: `app-${st.id}`,
      userId: st.uId,
      action: 'Application Submitted',
      description: `Student ${st.name} submitted registration application.`,
      createdAt: new Date().toISOString(),
    });

    if (st.assign) {
      db.activityLogs.push({
        id: `log-${st.id}-2`,
        agencyId: 'agency-1',
        studentId: st.id,
        applicationId: `app-${st.id}`,
        userId: 'user-admin1',
        action: 'Agent Assigned',
        description: `${st.name} was assigned to agent by Admin.`,
        createdAt: new Date().toISOString(),
      });

      // Chat Messages
      db.messages.push({
        id: `msg-${st.id}-1`,
        senderId: st.agentId === 'agent-1' ? 'user-agent1' : st.agentId === 'agent-2' ? 'user-agent2' : 'user-agent3',
        receiverId: st.uId,
        studentId: st.id,
        agencyId: 'agency-1',
        message: `Hello ${st.name}! Welcome to Global Education Consultants. I'm your advisor, and I'll help you secure your admissions for ${st.course}. Please upload your transcript and passport to begin.`,
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      });

      db.messages.push({
        id: `msg-${st.id}-2`,
        senderId: st.uId,
        receiverId: st.agentId === 'agent-1' ? 'user-agent1' : st.agentId === 'agent-2' ? 'user-agent2' : 'user-agent3',
        studentId: st.id,
        agencyId: 'agency-1',
        message: 'Thank you! I have uploaded my passport and transcript. Let me know if you need anything else.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
      });
    }
  }

  // Add Students for Agency 2 (Study Abroad Experts)
  const studentNames2 = [
    { id: 'student-11', uId: 'user-stud11', name: 'Mary Smith', email: 'mary.smith@gmail.com', country: 'Nigeria', course: 'Public Health', intake: 'September 2027', assign: true, agentId: 'agent-4', stage: 'SCHOOL_SELECTION', progress: 50 },
    { id: 'student-12', uId: 'user-stud12', name: 'James Parker', email: 'james.parker@gmail.com', country: 'Ghana', course: 'Civil Engineering', intake: 'September 2027', assign: false, stage: 'SUBMITTED', progress: 8 },
    { id: 'student-13', uId: 'user-stud13', name: 'Linda Carter', email: 'linda.carter@gmail.com', country: 'India', course: 'Computer Science', intake: 'January 2027', assign: true, agentId: 'agent-5', stage: 'DOCUMENTS_APPROVED', progress: 42 },
    { id: 'student-14', uId: 'user-stud14', name: 'Robert Vance', email: 'robert.vance@gmail.com', country: 'United States', course: 'MBA', intake: 'May 2027', assign: true, agentId: 'agent-6', stage: 'COMPLETED', progress: 100 },
  ];

  for (const st of studentNames2) {
    db.users.push({
      id: st.uId,
      name: st.name,
      email: st.email,
      phone: '+1 (555) 888-0000',
      password: passHash,
      role: 'STUDENT',
      agencyId: 'agency-2',
      createdAt: new Date().toISOString(),
    });

    db.students.push({
      id: st.id,
      userId: st.uId,
      agencyId: 'agency-2',
      assignedAgentId: st.assign ? st.agentId : null,
      assignmentStatus: st.assign ? 'ASSIGNED' : 'UNASSIGNED',
      createdAt: new Date().toISOString(),
    });

    db.applications.push({
      id: `app-${st.id}`,
      studentId: st.id,
      agencyId: 'agency-2',
      assignedAgentId: st.assign ? st.agentId : null,
      status: st.stage,
      progressPercentage: st.progress,
      fullName: st.name,
      email: st.email,
      phone: '+1 (555) 888-0000',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.documents.push({
      id: `doc-${st.id}-0`,
      studentId: st.id,
      applicationId: `app-${st.id}`,
      agencyId: 'agency-2',
      assignedAgentId: st.assign ? st.agentId : null,
      documentType: 'International Passport',
      status: 'REQUIRED',
      fileUrl: null,
      comment: null,
    });
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log('Local file-based database seeded successfully at', DB_PATH);
}

seed().catch(err => {
  console.error('Error seeding local database:', err);
});
