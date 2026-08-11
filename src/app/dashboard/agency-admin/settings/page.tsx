'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Save, AlertCircle, CheckCircle, Settings, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AgencyAdminSettingsPage() {
  const { user, loading, logout, mutate } = useUser();

  // Agency fields state
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('ADMIN_ONLY');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);



  // Prepopulate on user session load
  useEffect(() => {
    if (user?.agency) {
      const ag = user.agency;
      setName(ag.name || '');
      setLogo(ag.logo || '');
      setDescription(ag.description || '');
      setEmail(ag.email || '');
      setPhone(ag.phone || '');
      setWebsite(ag.website || '');
      setAddress(ag.address || '');
      setCountry(ag.country || '');
      setAssignmentMode(ag.assignmentMode || 'ADMIN_ONLY');
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, logo, description, email, phone, website, address, country, assignmentMode
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Agency settings updated successfully!');
        await mutate(); // Refresh session details
      } else {
        setErrorMsg(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      setErrorMsg('Connection failed.');
    } finally {
      setSaving(false);
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
      <main className="flex-1 p-6 lg:p-10 w-full space-y-6 overflow-y-auto">
        
        {/* Back Link */}
        <Link href="/dashboard/agency-admin" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agency Settings</h1>
            <p className="text-slate-500 text-sm font-light mt-1">Configure your agency details, branding, and student assignment workflows.</p>
          </div>
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

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Core Settings Profile */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Agency Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo Image URL</label>
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">About Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-3 outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Website URL</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Country Location</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Assignment Settings Profile (Section 3 & 23) */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Student Assignment Workflow</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option A */}
                <label className="border border-slate-200 hover:border-cyan-500 p-4 rounded-xl flex items-start space-x-3 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="assignmentMode"
                    value="ADMIN_ONLY"
                    checked={assignmentMode === 'ADMIN_ONLY'}
                    onChange={() => setAssignmentMode('ADMIN_ONLY')}
                    className="mt-1 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Option A &bull; Admin Assignment Only</h4>
                    <p className="text-slate-400 text-xs font-light mt-1">
                      Only Agency Administrators can assign registered students to agents. Claim panels are disabled.
                    </p>
                  </div>
                </label>

                {/* Option B */}
                <label className="border border-slate-200 hover:border-cyan-500 p-4 rounded-xl flex items-start space-x-3 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="assignmentMode"
                    value="ADMIN_AND_CLAIM"
                    checked={assignmentMode === 'ADMIN_AND_CLAIM'}
                    onChange={() => setAssignmentMode('ADMIN_AND_CLAIM')}
                    className="mt-1 text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Option B &bull; Admin + Agent Claim</h4>
                    <p className="text-slate-400 text-xs font-light mt-1">
                      Admins can assign students, AND agents are allowed to claim available unassigned students.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="border-t border-slate-100 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  );
}

