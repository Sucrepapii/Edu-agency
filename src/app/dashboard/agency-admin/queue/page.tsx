'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Search, Filter, UserCheck, Eye, HelpCircle, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QueueStudent {
  id: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  application?: {
    id: string;
    prefCountry?: string;
    prefCourse?: string;
    prefIntake?: string;
    status: string;
  };
}

interface AgentOption {
  id: string;
  user: {
    name: string;
  };
  position?: string;
}

export default function AgencyAdminQueuePage() {
  const { user, loading, logout } = useUser();
  
  const [students, setStudents] = useState<QueueStudent[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<QueueStudent | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const [loadingList, setLoadingList] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');



  useEffect(() => {
    if (user?.agencyId) {
      loadQueueData();
    }
  }, [user]);

  const loadQueueData = async () => {
    try {
      setLoadingList(true);
      
      // Load unassigned student queue
      const qRes = await fetch('/api/agent/unassigned');
      if (qRes.ok) {
        const qData = await qRes.json();
        setStudents(qData.students || []);
      }

      // Load agents list for the dropdown options
      const aRes = await fetch('/api/admin/agents');
      if (aRes.ok) {
        const aData = await aRes.json();
        const activeAgents = (aData.agents || []).filter((ag: any) => ag.status === 'ACTIVE');
        setAgents(activeAgents);
        if (activeAgents.length > 0) {
          setSelectedAgentId(activeAgents[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load queue details:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStudent || !selectedAgentId) return;

    try {
      setAssigning(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          agentId: selectedAgentId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully assigned ${selectedStudent.user.name} to agent.`);
        setSelectedStudent(null);
        loadQueueData(); // Reload list
      } else {
        setErrorMsg(data.error || 'Assignment failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to assignment service.');
    } finally {
      setAssigning(false);
    }
  };

  // Search filter
  const filteredStudents = students.filter((s) =>
    s.user.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.application?.prefCountry || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user!} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        
        {/* Back Link */}
        <Link href="/dashboard/agency-admin" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Students / Unassigned Queue</h1>
          <p className="text-slate-500 text-sm font-light mt-1">Review student applications that have not yet been assigned to a counselor.</p>
        </div>

        {/* Messaging Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm shadow-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search unassigned by name or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg pl-9 pr-4 py-2 outline-none text-xs"
            />
          </div>
        </div>

        {/* Queue Table (Section 7) */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Preferred Course</th>
                  <th className="px-6 py-4">Preferred Intake</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingList ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-light">
                      Loading queue details...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-light">
                      No unassigned student applications in the queue.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{st.user.name}</p>
                          <p className="text-slate-400 text-xs font-light">{st.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{st.application?.prefCountry || '—'}</td>
                      <td className="px-6 py-4">{st.application?.prefCourse || '—'}</td>
                      <td className="px-6 py-4">{st.application?.prefIntake || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-light text-xs">
                        {new Date(st.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Assign Agent
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Modal (Section 8) */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-md">Assign Agent</h3>
                  <p className="text-slate-400 text-xs font-light mt-1">
                    Select a consultant to manage this student application.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2 font-light text-slate-600">
                <div><span className="font-bold text-slate-700">Student:</span> {selectedStudent.user.name}</div>
                <div><span className="font-bold text-slate-700">Application:</span> {selectedStudent.application?.prefCourse || '—'} ({selectedStudent.application?.prefIntake || '—'})</div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Select Agent</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2.5 outline-none text-xs appearance-none cursor-pointer"
                >
                  {agents.length === 0 ? (
                    <option value="">No active agents available</option>
                  ) : (
                    agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.user.name} ({ag.position || 'Consultant'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 text-xs font-semibold pt-4">
                <button
                  onClick={() => setSelectedStudent(null)}
                  disabled={assigning}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || agents.length === 0}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign Student'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
