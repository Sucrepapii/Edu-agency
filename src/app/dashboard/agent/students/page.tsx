'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Search, Eye, Filter, UserCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StudentRow {
  id: string;
  user: {
    name: string;
    email: string;
  };
  assignmentStatus: string;
  documents: any[];
  application?: {
    id: string;
    status: string;
    progressPercentage: number;
    prefCountry?: string;
    prefCourse?: string;
    updatedAt: string;
  };
}

export default function AgentStudentsPage() {
  const { user, loading, logout } = useUser();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loadingList, setLoadingList] = useState(true);



  useEffect(() => {
    if (user?.agentProfile?.id) {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/agent/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Filter students based on search and status (Section 34 Search & Filtering)
  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.user.name.toLowerCase().includes(search.toLowerCase()) ||
      st.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (st.application?.prefCountry || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || st.application?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        
        {/* Back Link */}
        <Link href="/dashboard/agent" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
          <p className="text-slate-500 text-sm font-light mt-1">Review profiles, chat, and update application stages for your assigned roster.</p>
        </div>

        {/* Filter and Search Bar (Section 34) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search students by name, email, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 outline-none transition-all text-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2 outline-none text-xs cursor-pointer"
            >
              <option value="">All Stages</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="DOCUMENTS_REQUIRED">Documents Required</option>
              <option value="DOCUMENTS_UNDER_REVIEW">Under Review</option>
              <option value="SCHOOL_SELECTION">School Selection</option>
              <option value="OFFER_RECEIVED">Offer Received</option>
              <option value="VISA_PROCESSING">Visa Processing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Application Stage</th>
                  <th className="px-6 py-4">Documents</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingList ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-light">
                      Loading your student list...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-light">
                      No matching students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const app = st.application;
                    const docs = st.documents || [];
                    const uploadedCount = docs.filter(d => d.status !== 'REQUIRED').length;
                    const totalCount = docs.length;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-800">{st.user.name}</p>
                            <p className="text-slate-400 text-xs font-light">{st.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {app ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                                {app.status.toLowerCase().replace(/_/g, ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-cyan-500 h-full" style={{ width: `${app.progressPercentage}%` }}></div>
                                </div>
                                <span className="text-[10px] text-slate-400">{app.progressPercentage}%</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-light">No Application Started</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-slate-500 text-xs font-light">
                            {uploadedCount} / {totalCount} uploaded
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link
                            href={`/dashboard/agent/students/${st.id}`}
                            className="bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all inline-flex items-center gap-1 group"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
