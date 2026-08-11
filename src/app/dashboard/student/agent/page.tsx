'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { User, MessageSquare, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentAgentPage() {
  const { user, loading, logout, mutate } = useUser();
  const [reason, setReason] = useState('');
  const [requestingChange, setRequestingChange] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const agent = user.studentProfile?.assignedAgent;

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for requesting a change.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/student/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Your request to change your agent has been submitted to the Agency Administrator.');
        setReason('');
        setRequestingChange(false);
        mutate(); // Reload details
      } else {
        setErrorMsg(data.error || 'Failed to submit request.');
      }
    } catch (err) {
      setErrorMsg('Connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 w-full space-y-6 overflow-y-auto">
        
        {/* Back Link */}
        <Link href="/dashboard/student" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Education Agent</h1>
          <p className="text-slate-500 text-sm font-light mt-1">Get details about your assigned counselor or request reassignment.</p>
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

        {agent ? (
          <div className="space-y-6">
            {/* Agent Profile Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                  <img 
                    src={agent.profilePhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'} 
                    alt={agent.user.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <span className="bg-cyan-50 text-cyan-700 font-semibold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
                    Assigned Agent
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{agent.user.name}</h2>
                  <p className="text-slate-500 font-medium text-sm">{agent.position || 'Education Agent'}</p>
                  <p className="text-slate-400 text-xs font-light">{user.agency?.name || 'Education Agency'}</p>
                </div>
                <Link
                  href="/dashboard/student/messages"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-cyan-600/10 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Agent
                </Link>
              </div>

              {agent.specialization && (
                <div className="border-t border-slate-100 pt-4 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialization</h4>
                  <p className="text-slate-700 text-sm">{agent.specialization}</p>
                </div>
              )}

              {agent.bio && (
                <div className="border-t border-slate-100 pt-4 space-y-1">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Biography</h4>
                  <p className="text-slate-600 text-sm font-light leading-relaxed">{agent.bio}</p>
                </div>
              )}
            </div>

            {/* Request Agent Change Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Request Agent Change</h3>
                  <p className="text-slate-400 text-xs font-light mt-1">If you feel you require a different advisor, submit a formal request.</p>
                </div>
                {!requestingChange && (
                  <button
                    onClick={() => setRequestingChange(true)}
                    className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Request Change
                  </button>
                )}
              </div>

              {requestingChange && (
                <form onSubmit={handleRequestChange} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason for requesting change</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please clarify the reasons for this change request (e.g. alignment of specialization, communication latency, etc.). It will be sent to the Agency Admin."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-3 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRequestingChange(false)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-sm">
            <User className="h-16 w-16 text-slate-300 mx-auto" />
            <div>
              <h2 className="font-bold text-slate-800 text-lg">No Agent Assigned Yet</h2>
              <p className="text-slate-400 text-sm font-light max-w-sm mx-auto mt-1">
                Your education agency will assign a dedicated agent to your roster as soon as they review your application.
              </p>
            </div>
            <Link
              href="/dashboard/student"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm inline-block shadow-sm transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}

