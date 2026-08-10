'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit2, Search, HelpCircle, AlertCircle, CheckCircle, UserCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AgentRow {
  id: string;
  position?: string;
  specialization?: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  students?: any[];
}

export default function AgencyAdminAgentsPage() {
  const { user, loading, logout } = useUser();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

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

  useEffect(() => {
    if (user?.agencyId) {
      loadAgents();
    }
  }, [user]);

  const loadAgents = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, password, position, specialization
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully created agent ${name}!`);
        setIsCreateOpen(false);
        // Clear fields
        setName(''); setEmail(''); setPhone(''); setPassword(''); setPosition(''); setSpecialization('');
        loadAgents();
      } else {
        setErrorMsg(data.error || 'Failed to create agent.');
      }
    } catch (err) {
      setErrorMsg('Connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          name, phone, position, specialization, status
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully updated agent ${name}!`);
        setIsEditOpen(false);
        setSelectedAgent(null);
        loadAgents();
      } else {
        setErrorMsg(data.error || 'Failed to update agent.');
      }
    } catch (err) {
      setErrorMsg('Connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (agent: AgentRow) => {
    setSelectedAgent(agent);
    setName(agent.user.name);
    setPhone(agent.user.phone || '');
    setPosition(agent.position || '');
    setSpecialization(agent.specialization || '');
    setStatus(agent.status);
    setIsEditOpen(true);
  };

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
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agents Management</h1>
            <p className="text-slate-500 text-sm font-light mt-1">Add, edit, deactivate, or monitor the workloads of your education consultants.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-cyan-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Agent
          </button>
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

        {/* Agents Table List (Section 22) */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Active Workload</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingList ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-light">
                      Loading team roster...
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-light">
                      No agent profiles created. Click "Add Agent" to start building your team.
                    </td>
                  </tr>
                ) : (
                  agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div>
                          <p>{ag.user.name}</p>
                          <p className="text-slate-400 text-xs font-light">{ag.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-light text-slate-600">{ag.position || '—'}</td>
                      <td className="px-6 py-4 font-light text-slate-600">{ag.specialization || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                          {ag.students?.length || 0} students
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ag.status === 'ACTIVE' ? (
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-xs">Active</span>
                        ) : (
                          <span className="bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full text-xs">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(ag)}
                          className="bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Agent Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100 overflow-y-auto max-h-[90vh]">
              <h3 className="font-bold text-slate-900 text-md">Add New Agent</h3>
              
              <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Position Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Education Advisor"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Admissions Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. European Universities"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 text-xs font-semibold pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Agent Modal */}
        {isEditOpen && selectedAgent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100 overflow-y-auto max-h-[90vh]">
              <h3 className="font-bold text-slate-900 text-md">Edit Agent Profile</h3>
              
              <form onSubmit={handleEditAgent} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Position Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Admissions Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs appearance-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive (Deactivated)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 text-xs font-semibold pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedAgent(null);
                    }}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
