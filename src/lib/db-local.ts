import fs from 'fs';
import path from 'path';

// Define the database path
const DB_PATH = path.join(process.cwd(), 'prisma/db.json');

// Helper to ensure database file exists
function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      agencies: [],
      users: [],
      agents: [],
      students: [],
      applications: [],
      documents: [],
      messages: [],
      notifications: [],
      activityLogs: [],
      agentChangeRequests: []
    }, null, 2));
  }
}

// Read database
export function readDb(): any {
  initDb();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Write database
export function writeDb(data: any) {
  initDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Simple locker to prevent race conditions during write/read ops
let dbMutex = Promise.resolve();
export async function runLocked<T>(fn: () => Promise<T> | T): Promise<T> {
  const result = dbMutex.then(fn);
  dbMutex = result.then(() => {}).catch(() => {});
  return result;
}

// Helper for generating UUIDs
export function uuid(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
