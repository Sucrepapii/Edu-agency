'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { UserCheck2, AlertCircle, CheckCircle, HelpCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UnassignedStudent {
  id: string;
  user: {
    name: string;
  };
  createdAt: string;
  application?: {
    id: string;
    prefCountry?: string;
    prefCourse?: string;
    prefIntake?: string;
    createdAt: string;
  };
}

export default function AgentClaimPage() {
  const { user, loading, logout } = useUser();
  const [unassignedList, setUnassignedList] = useState<UnassignedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UnassignedStudent | null>(null);
  
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  useEffect(() => {
    if (user?.agencyId) {
      loadUnassigned();
    }
  }, [user]);

  const loadUnassigned = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/agent/unassigned');
      if (res.ok) {
        const data = await res.json();
        setUnassignedList(data.students || []);
      }
    } catch (err) {
      console.error('Failed to load unassigned list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedStudent) return;

    try {
      setClaiming(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/agent/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully claimed student ${selectedStudent.user.name}!`);
        setSelectedStudent(null);
        loadUnassigned(); // Reload list
      } else {
        setErrorMsg(data.error || 'Claim failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to claim service.');
    } finally {
      setClaiming(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Available Students</h1>
          <p className="text-slate-500 text-sm font-light mt-1">Claim unassigned student applications and add them to your roster.</p>
        </div>

        {/* Messaging alerts */}
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

        {/* Security / Privacy Warning */}
        <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl flex items-start gap-2.5 text-xs text-cyan-800 shadow-sm leading-relaxed font-light">
          <ShieldCheck className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Privacy Compliance Notice:</span> Under the multi-tenant protection policy, sensitive contact details, qualifications, and uploaded documents are locked. These details will be revealed only after the student profile has been claimed.
          </div>
        </div>

        {/* Student Cards List */}
        {loadingList ? (
          <div className="text-center py-12 text-slate-400">Loading claim board...</div>
        ) : unassignedList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <UserCheck2 className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800">No Available Students</h3>
            <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
              All students in your agency have been assigned. New registrations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unassignedList.map((st) => (
              <div key={st.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-cyan-300 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-cyan-600 text-sm">
                      {st.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{st.user.name}</h3>
                      <p className="text-[10px] text-slate-400 font-light">Registered {new Date(st.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-y border-slate-100 py-3 font-light text-slate-600">
                    <div className="flex justify-between">
                      <span>Country:</span>
                      <span className="font-semibold text-slate-800">{st.application?.prefCountry || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Course:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{st.application?.prefCourse || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Intake:</span>
                      <span className="font-semibold text-slate-800">{st.application?.prefIntake || '—'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(st)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg text-xs mt-4 transition-all shadow-sm cursor-pointer"
                >
                  Claim Student
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-md">Confirm Student Claim</h3>
                  <p className="text-slate-500 text-xs font-light mt-1">
                    Are you sure you want to claim <span className="font-bold">{selectedStudent.user.name}</span>?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 text-xs font-semibold pt-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  disabled={claiming}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
                >
                  {claiming ? 'Claiming...' : 'Confirm Claim'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
