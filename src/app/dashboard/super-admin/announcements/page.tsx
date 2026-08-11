'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Megaphone, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

export default function AnnouncementsPage() {
  const { user, loading, logout } = useUser();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadAnnouncements();
  }, [user]);

  const loadAnnouncements = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/super-admin/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/super-admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });
      if (res.ok) {
        setTitle('');
        setMessage('');
        setIsFormOpen(false);
        loadAnnouncements();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        loadAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await fetch(`/api/super-admin/announcements/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />
      <main className="flex-1 p-6 lg:p-10 w-full space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-cyan-600" />
              Platform Announcements
            </h1>
            <p className="text-sm text-slate-500 font-light mt-1">
              Broadcast messages to all agents and students on the platform.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Announcement
          </button>
        </div>

        {/* Announcements List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingList ? (
            <div className="p-8 text-center text-slate-400">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No announcements found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900">{ann.title}</h3>
                      {ann.isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm font-light max-w-2xl">{ann.message}</p>
                    <p className="text-slate-400 text-xs font-light mt-2">
                      Posted on {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 shrink-0">
                    <button
                      onClick={() => toggleStatus(ann.id, ann.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        ann.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={ann.isActive ? "Deactivate" : "Activate"}
                    >
                      {ann.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Create Announcement</h3>
              <form onSubmit={handleCreate} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Scheduled Maintenance"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Enter the announcement message..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all resize-none"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Broadcasting...' : 'Broadcast'}
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

