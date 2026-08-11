'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Plus, Eye, CheckCircle, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AgencyRow {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  country?: string;
  status: string;
  assignmentMode: string;
  createdAt: string;
}

export default function SuperAdminAgenciesPage() {
  const { user, loading, logout } = useUser();
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Modal / Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [agencyToToggle, setAgencyToToggle] = useState<{ id: string, name: string, status: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadAgencies();
    }
  }, [user]);

  const loadAgencies = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/super-admin/agencies');
      if (res.ok) {
        const data = await res.json();
        setAgencies(data.agencies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/super-admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, email, phone, country }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully created agency ${name}!`);
        setIsCreateOpen(false);
        setName(''); setDescription(''); setEmail(''); setPhone(''); setCountry('');
        loadAgencies();
      } else {
        setErrorMsg(data.details || data.error || 'Failed to create agency.');
      }
    } catch (err) {
      setErrorMsg('Connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAgencyStatus = async () => {
    if (!agencyToToggle) return;
    
    try {
      const targetStatus = agencyToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const res = await fetch('/api/super-admin/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agencyToToggle.id, status: targetStatus }),
      });

      if (res.ok) {
        setSuccessMsg(`Agency status toggled to ${targetStatus.toLowerCase()} successfully.`);
        setAgencyToToggle(null);
        loadAgencies();
      }
    } catch (err) {
      console.error('Failed to toggle agency status:', err);
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

      <main className="flex-1 p-6 lg:p-10 w-full space-y-6 overflow-y-auto">
        
        {/* Back Link */}
        <Link href="/dashboard/super-admin" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agencies Management</h1>
            <p className="text-slate-500 text-sm font-light mt-1">Configure study abroad education agencies, view tenant volumes, and manage system locks.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-cyan-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Agency
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

        {/* Agencies Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Agency Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loadingList ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-light">
                      Loading tenant database...
                    </td>
                  </tr>
                ) : agencies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-light">
                      No agencies registered on the platform. Click "Create Agency" to begin.
                    </td>
                  </tr>
                ) : (
                  agencies.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div>
                          <Link href={`/dashboard/super-admin/agencies/${ag.id}`} className="font-semibold hover:text-cyan-600 transition-colors">
                            {ag.name}
                          </Link>
                          <p className="text-slate-400 text-[10px] font-light truncate max-w-[150px]">{ag.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-light text-slate-650 max-w-xs truncate">{ag.description || '—'}</td>
                      <td className="px-6 py-4 font-light text-slate-600">{ag.country || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ag.status === 'ACTIVE' ? (
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">Active</span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">Suspended</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setAgencyToToggle({ id: ag.id, name: ag.name, status: ag.status })}
                          className={`font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                            ag.status === 'ACTIVE'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {ag.status === 'ACTIVE' ? 'Suspend Agency' : 'Activate Agency'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Agency Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100 overflow-y-auto max-h-[90vh]">
              <h3 className="font-bold text-slate-900 text-md">Register New Agency</h3>
              
              <form onSubmit={handleCreateAgency} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">About Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Support Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Country Location</label>
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
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
                    {submitting ? 'Onboarding...' : 'Onboard Agency'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toggle Confirmation Modal */}
        {agencyToToggle && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {agencyToToggle.status === 'ACTIVE' ? 'Suspend Agency' : 'Activate Agency'}
              </h3>
              <p className="text-slate-600 text-sm font-light">
                Are you sure you want to {agencyToToggle.status === 'ACTIVE' ? 'suspend' : 'activate'} <strong>{agencyToToggle.name}</strong>?
              </p>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAgencyToToggle(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={toggleAgencyStatus}
                  className={`flex-1 font-semibold py-2.5 rounded-xl shadow-md transition-colors cursor-pointer ${
                    agencyToToggle.status === 'ACTIVE' 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

