'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function GlobalSettingsPage() {
  const { user, loading, logout } = useUser();
  const [settings, setSettings] = useState({
    platformFeePercentage: '5',
    maintenanceMode: 'false',
    supportEmail: 'support@eduagent.com',
    maxAgencies: '100',
  });
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/super-admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccessMsg('Settings saved successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />
      <main className="flex-1 p-6 lg:p-10 w-full space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-cyan-600" />
            Global Platform Settings
          </h1>
          <p className="text-sm text-slate-500 font-light mt-1">
            Configure core platform behaviors and defaults across all agencies.
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold text-sm">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingData ? (
            <div className="p-8 text-center text-slate-400">Loading settings...</div>
          ) : (
            <>
              <div className="p-8 space-y-8">
                
                {/* Financial Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Financial Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Platform Transaction Fee (%)</label>
                      <input
                        type="number"
                        name="platformFeePercentage"
                        value={settings.platformFeePercentage}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-400">Percentage taken from every agency invoice payment.</p>
                    </div>
                  </div>
                </div>

                {/* System Limits */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">System Limits & Defaults</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Max Agencies Allowed</label>
                      <input
                        type="number"
                        name="maxAgencies"
                        value={settings.maxAgencies}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Global Support Email</label>
                      <input
                        type="email"
                        name="supportEmail"
                        value={settings.supportEmail}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600">Maintenance Mode</label>
                      <select
                        name="maintenanceMode"
                        value={settings.maintenanceMode}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all appearance-none"
                      >
                        <option value="false">Disabled (Normal Operations)</option>
                        <option value="true">Enabled (Block all non-admin logins)</option>
                      </select>
                      <p className="text-[10px] text-slate-400">Warning: Enabling this will log out active users.</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  );
}

