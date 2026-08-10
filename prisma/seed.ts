import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const passHash = await bcrypt.hash('password123', 10);

  console.log('Seeding Render PostgreSQL...');

  // Create Platform Super Admin
  await prisma.user.create({
    data: {
      name: 'Alex Platform Admin',
      email: 'superadmin@platform.com',
      phone: '+1 (555) 010-0000',
      password: passHash,
      role: 'SUPER_ADMIN',
    },
  });

  // Create Agency 1
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

  // Create Agency Admin
  await prisma.user.create({
    data: {
      name: 'Sarah Admin',
      email: 'admin1@globaledu.com',
      phone: '+1 (555) 100-2001',
      password: passHash,
      role: 'AGENCY_ADMIN',
      agencyId: agency1.id,
    },
  });

  // Create Agent
  const agentUser = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.j@globaledu.com',
      phone: '+1 (555) 100-3000',
      password: passHash,
      role: 'AGENT',
      agencyId: agency1.id,
    },
  });

  const agent = await prisma.agent.create({
    data: {
      userId: agentUser.id,
      agencyId: agency1.id,
      specialization: 'UK & Canada Admissions',
      position: 'Senior Education Consultant',
      bio: 'Experienced specialist in admissions.',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      status: 'ACTIVE',
    },
  });

  // Create Student
  const studentUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 999-0000',
      password: passHash,
      role: 'STUDENT',
      agencyId: agency1.id,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      agencyId: agency1.id,
      assignedAgentId: agent.id,
      assignmentStatus: 'ASSIGNED',
    },
  });

  const app = await prisma.application.create({
    data: {
      studentId: student.id,
      agencyId: agency1.id,
      assignedAgentId: agent.id,
      status: 'SCHOOL_SELECTION',
      progressPercentage: 50,
      fullName: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 999-0000',
      prefCountry: 'Nigeria',
      prefCourse: 'Computer Science',
      prefIntake: 'September 2027',
      budget: '$25,000/yr',
      prefSchool: 'Select University',
      dob: '2002-05-15',
      gender: 'Male',
      nationality: 'Nigeria',
      address: '123 Student Street, Main City',
    },
  });

  // Create Document
  await prisma.document.create({
    data: {
      studentId: student.id,
      agencyId: agency1.id,
      assignedAgentId: agent.id,
      documentType: 'International Passport',
      status: 'APPROVED',
      fileUrl: '/uploads/mock-passport.pdf',
      uploadedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    },
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
