import { readDb, writeDb, runLocked, uuid } from './db-local';

// Prisma mock wrapper that mimics the exact schema relationships
export class MockTable<T> {
  private tableName: string; // e.g. "users", "agencies", etc.

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getCollection(db: any): any[] {
    return db[this.tableName] || [];
  }

  private setCollection(db: any, list: any[]) {
    db[this.tableName] = list;
  }

  // Matches Prisma's findMany
  async findMany(args?: { where?: any; include?: any; orderBy?: any; take?: number; skip?: number }): Promise<any[]> {
    return runLocked(async () => {
      const db = readDb();
      let list = this.getCollection(db);

      if (args?.where) {
        list = list.filter(item => matchWhere(item, args.where));
      }

      if (args?.orderBy) {
        const orderKey = Object.keys(args.orderBy)[0];
        const direction = args.orderBy[orderKey] === 'desc' ? -1 : 1;
        list.sort((a, b) => {
          if (a[orderKey] < b[orderKey]) return -1 * direction;
          if (a[orderKey] > b[orderKey]) return 1 * direction;
          return 0;
        });
      }

      if (args?.skip !== undefined) {
        list = list.slice(args.skip);
      }
      if (args?.take !== undefined) {
        list = list.slice(0, args.take);
      }

      // Resolve relations
      return list.map(item => resolveInclusions(this.tableName, item, args?.include, db));
    });
  }

  // Matches findUnique
  async findUnique(args: { where: any; include?: any }): Promise<any | null> {
    return runLocked(async () => {
      const db = readDb();
      const list = this.getCollection(db);
      const item = list.find(item => matchWhere(item, args.where));
      if (!item) return null;
      return resolveInclusions(this.tableName, item, args.include, db);
    });
  }

  // Matches findFirst
  async findFirst(args?: { where?: any; include?: any; orderBy?: any }): Promise<any | null> {
    const list = await this.findMany(args);
    return list.length > 0 ? list[0] : null;
  }

  // Matches create
  async create(args: { data: any; include?: any }): Promise<any> {
    return runLocked(async () => {
      const db = readDb();
      const list = this.getCollection(db);

      const newItem = {
        id: args.data.id || uuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args.data,
      };

      list.push(newItem);
      this.setCollection(db, list);
      writeDb(db);

      return resolveInclusions(this.tableName, newItem, args.include, db);
    });
  }

  // Matches update
  async update(args: { where: any; data: any; include?: any }): Promise<any> {
    return runLocked(async () => {
      const db = readDb();
      const list = this.getCollection(db);
      const index = list.findIndex(item => matchWhere(item, args.where));
      if (index === -1) {
        throw new Error(`Record not found in ${this.tableName} matching ${JSON.stringify(args.where)}`);
      }

      const currentItem = list[index];
      const updatedItem = {
        ...currentItem,
        ...args.data,
        updatedAt: new Date().toISOString(),
      };

      list[index] = updatedItem;
      this.setCollection(db, list);
      writeDb(db);

      return resolveInclusions(this.tableName, updatedItem, args.include, db);
    });
  }

  // Matches updateMany
  async updateMany(args: { where?: any; data: any }): Promise<{ count: number }> {
    return runLocked(async () => {
      const db = readDb();
      const list = this.getCollection(db);
      let count = 0;

      const updatedList = list.map(item => {
        if (!args.where || matchWhere(item, args.where)) {
          count++;
          return {
            ...item,
            ...args.data,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

      this.setCollection(db, updatedList);
      writeDb(db);

      return { count };
    });
  }

  // Matches delete
  async delete(args: { where: any; include?: any }): Promise<any> {
    return runLocked(async () => {
      const db = readDb();
      let list = this.getCollection(db);
      const index = list.findIndex(item => matchWhere(item, args.where));
      if (index === -1) {
        throw new Error(`Record not found in ${this.tableName} matching ${JSON.stringify(args.where)}`);
      }

      const deletedItem = list[index];
      list.splice(index, 1);
      this.setCollection(db, list);
      writeDb(db);

      return resolveInclusions(this.tableName, deletedItem, args.include, db);
    });
  }

  // Matches count
  async count(args?: { where?: any }): Promise<number> {
    return runLocked(async () => {
      const db = readDb();
      let list = this.getCollection(db);
      if (args?.where) {
        list = list.filter(item => matchWhere(item, args.where));
      }
      return list.length;
    });
  }
}

// Check if item matches Prisma-like query where conditions
function matchWhere(item: any, where: any): boolean {
  for (const key of Object.keys(where)) {
    const queryVal = where[key];
    
    // Support nested logical operators: AND, OR, NOT
    if (key === 'AND') {
      const conditions = Array.isArray(queryVal) ? queryVal : [queryVal];
      if (!conditions.every(c => matchWhere(item, c))) return false;
      continue;
    }
    if (key === 'OR') {
      const conditions = Array.isArray(queryVal) ? queryVal : [queryVal];
      if (!conditions.some(c => matchWhere(item, c))) return false;
      continue;
    }
    if (key === 'NOT') {
      const conditions = Array.isArray(queryVal) ? queryVal : [queryVal];
      if (conditions.some(c => matchWhere(item, c))) return false;
      continue;
    }

    const itemVal = item[key];

    if (queryVal && typeof queryVal === 'object') {
      // Support sub-filters: equals, in, notIn, contains, startsWith, etc.
      if ('equals' in queryVal && itemVal !== queryVal.equals) return false;
      if ('in' in queryVal && !queryVal.in.includes(itemVal)) return false;
      if ('notIn' in queryVal && queryVal.notIn.includes(itemVal)) return false;
      if ('contains' in queryVal) {
        const needle = queryVal.contains.toLowerCase();
        const haystack = (itemVal || '').toString().toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if ('mode' in queryVal) {
        // Handle case-insensitive flags or others
      }
      if ('not' in queryVal && itemVal === queryVal.not) return false;
      continue;
    }

    if (itemVal !== queryVal) return false;
  }
  return true;
}

// Resolve relations in mock database
function resolveInclusions(tableName: string, item: any, include: any, db: any): any {
  if (!include || !item) return item;

  const copy = { ...item };

  for (const relationKey of Object.keys(include)) {
    if (!include[relationKey]) continue;

    // Users relation resolutions
    if (tableName === 'users') {
      if (relationKey === 'agency') {
        copy.agency = db.agencies.find((a: any) => a.id === item.agencyId) || null;
      }
      if (relationKey === 'agentProfile') {
        const profile = db.agents.find((a: any) => a.userId === item.id) || null;
        copy.agentProfile = resolveInclusions('agents', profile, include.agentProfile?.include, db);
      }
      if (relationKey === 'studentProfile') {
        const profile = db.students.find((s: any) => s.userId === item.id) || null;
        copy.studentProfile = resolveInclusions('students', profile, include.studentProfile?.include, db);
      }
    }

    // Agents relation resolutions
    if (tableName === 'agents') {
      if (relationKey === 'user') {
        copy.user = db.users.find((u: any) => u.id === item.userId) || null;
      }
      if (relationKey === 'agency') {
        copy.agency = db.agencies.find((a: any) => a.id === item.agencyId) || null;
      }
      if (relationKey === 'students') {
        const students = db.students.filter((s: any) => s.assignedAgentId === item.id);
        copy.students = students.map((s: any) => resolveInclusions('students', s, include.students?.include, db));
      }
    }

    // Students relation resolutions
    if (tableName === 'students') {
      if (relationKey === 'user') {
        copy.user = db.users.find((u: any) => u.id === item.userId) || null;
      }
      if (relationKey === 'agency') {
        copy.agency = db.agencies.find((a: any) => a.id === item.agencyId) || null;
      }
      if (relationKey === 'assignedAgent') {
        const agent = db.agents.find((a: any) => a.id === item.assignedAgentId) || null;
        copy.assignedAgent = resolveInclusions('agents', agent, include.assignedAgent?.include, db);
      }
      if (relationKey === 'application') {
        const app = db.applications.find((a: any) => a.studentId === item.id) || null;
        copy.application = resolveInclusions('applications', app, include.application?.include, db);
      }
      if (relationKey === 'documents') {
        const docs = db.documents.filter((d: any) => d.studentId === item.id);
        copy.documents = docs.map((d: any) => resolveInclusions('documents', d, include.documents?.include, db));
      }
    }

    // Applications relation resolutions
    if (tableName === 'applications') {
      if (relationKey === 'student') {
        const student = db.students.find((s: any) => s.id === item.studentId) || null;
        copy.student = resolveInclusions('students', student, include.student?.include, db);
      }
      if (relationKey === 'agency') {
        copy.agency = db.agencies.find((a: any) => a.id === item.agencyId) || null;
      }
      if (relationKey === 'assignedAgent') {
        const agent = db.agents.find((a: any) => a.id === item.assignedAgentId) || null;
        copy.assignedAgent = resolveInclusions('agents', agent, include.assignedAgent?.include, db);
      }
      if (relationKey === 'documents') {
        const docs = db.documents.filter((d: any) => d.studentId === item.studentId);
        copy.documents = docs.map((d: any) => resolveInclusions('documents', d, include.documents?.include, db));
      }
    }

    // Documents relation resolutions
    if (tableName === 'documents') {
      if (relationKey === 'student') {
        const student = db.students.find((s: any) => s.id === item.studentId) || null;
        copy.student = resolveInclusions('students', student, include.student?.include, db);
      }
      if (relationKey === 'agency') {
        copy.agency = db.agencies.find((a: any) => a.id === item.agencyId) || null;
      }
      if (relationKey === 'assignedAgent') {
        const agent = db.agents.find((a: any) => a.id === item.assignedAgentId) || null;
        copy.assignedAgent = resolveInclusions('agents', agent, include.assignedAgent?.include, db);
      }
    }

    // Messages relation resolutions
    if (tableName === 'messages') {
      if (relationKey === 'sender') {
        copy.sender = db.users.find((u: any) => u.id === item.senderId) || null;
      }
      if (relationKey === 'receiver') {
        copy.receiver = db.users.find((u: any) => u.id === item.receiverId) || null;
      }
      if (relationKey === 'student') {
        copy.student = db.students.find((s: any) => s.id === item.studentId) || null;
      }
    }

    // AgentChangeRequests relation resolutions
    if (tableName === 'agentChangeRequests') {
      if (relationKey === 'student') {
        const student = db.students.find((s: any) => s.id === item.studentId) || null;
        copy.student = resolveInclusions('students', student, include.student?.include, db);
      }
      if (relationKey === 'currentAgent') {
        const agent = db.agents.find((a: any) => a.id === item.currentAgentId) || null;
        copy.currentAgent = resolveInclusions('agents', agent, include.currentAgent?.include, db);
      }
    }
  }

  return copy;
}

// Instantiate the exportable db client (exact API parity with Prisma)
const mockPrisma = {
  agency: new MockTable<any>('agencies'),
  user: new MockTable<any>('users'),
  agent: new MockTable<any>('agents'),
  student: new MockTable<any>('students'),
  application: new MockTable<any>('applications'),
  document: new MockTable<any>('documents'),
  message: new MockTable<any>('messages'),
  notification: new MockTable<any>('notifications'),
  activityLog: new MockTable<any>('activityLogs'),
  agentChangeRequest: new MockTable<any>('agentChangeRequests'),

  // Mock $transaction to support claims atomic updates
  $transaction: async (callback: (tx: any) => Promise<any>) => {
    return runLocked(async () => {
      // In our mock client, runLocked handles exclusive single-threaded locks.
      // So we just invoke the callback directly with the client.
      return callback(mockPrisma);
    });
  },
  $disconnect: async () => {}
};

// Export actual PrismaClient conditionally in production if configured
let exportDb: any;
if (process.env.USE_REAL_PRISMA === 'true') {
  try {
    const { PrismaClient } = require('@prisma/client');
    exportDb = new PrismaClient();
  } catch (err) {
    console.warn('Failed to load real PrismaClient, falling back to local JSON database.', err);
    exportDb = mockPrisma;
  }
} else {
  exportDb = mockPrisma;
}

export const prisma = exportDb;
