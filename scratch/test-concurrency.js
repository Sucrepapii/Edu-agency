const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Minimal mock database state implementation matching src/lib/db-local.ts
const DB_PATH = path.join(__dirname, '../prisma/db.json');

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let dbMutex = Promise.resolve();
async function runLocked(fn) {
  const result = dbMutex.then(fn);
  dbMutex = result.then(() => {}).catch(() => {});
  return result;
}

// Emulates atomic claim logic of /api/agent/claim
async function claimStudent(studentId, agentId) {
  return runLocked(async () => {
    const db = readDb();
    
    // Query condition: student is unassigned
    const studentIndex = db.students.findIndex(
      (s) => s.id === studentId && s.assignmentStatus === 'UNASSIGNED' && s.assignedAgentId === null
    );

    if (studentIndex === -1) {
      // Row count = 0, meaning student is already claimed
      return { success: false, error: 'Sorry, this student has already been assigned to another agent.' };
    }

    // Row count = 1, proceed with update
    db.students[studentIndex].assignedAgentId = agentId;
    db.students[studentIndex].assignmentStatus = 'ASSIGNED';
    
    writeDb(db);
    return { success: true, message: 'Student claimed successfully.' };
  });
}

async function runTest() {
  console.log('--- Concurrency Claim Lock Test ---');
  
  // Set test student (Peter Adams is unassigned in seeds)
  const studentId = 'student-3'; 
  const agent1 = 'agent-1';
  const agent2 = 'agent-2';

  // Ensure student starts as unassigned
  const db = readDb();
  const index = db.students.findIndex(s => s.id === studentId);
  if (index !== -1) {
    db.students[index].assignedAgentId = null;
    db.students[index].assignmentStatus = 'UNASSIGNED';
    writeDb(db);
  }

  console.log(`Initial student state: unassigned.`);
  console.log(`Triggering concurrent claims for Student ${studentId} by Agent ${agent1} and Agent ${agent2} simultaneously...`);

  // Fire requests concurrently using Promise.all
  const results = await Promise.all([
    claimStudent(studentId, agent1),
    claimStudent(studentId, agent2)
  ]);

  console.log('\nResults:');
  console.log('Request 1:', results[0]);
  console.log('Request 2:', results[1]);

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  console.log('\nSummary:');
  console.log('Successful claims:', successCount);
  console.log('Failed claims:', failureCount);

  if (successCount === 1 && failureCount === 1) {
    console.log('\n✅ SUCCESS: Concurrency check passed! Exactly one claim succeeded, and the other was blocked.');
  } else {
    console.log('\n❌ FAILURE: Concurrency locks failed.');
  }
}

runTest();
