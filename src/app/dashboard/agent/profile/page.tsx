'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Save, User, Camera, Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function AgentProfileSettings() {
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    position: '',
    specialization: '',
    bio: '',
    profilePhoto: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/agent/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.agent) {
            setFormData({
              position: data.agent.position || '',
              specialization: data.agent.specialization || '',
              bio: data.agent.bio || '',
              profilePhoto: data.agent.profilePhoto || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({ ...formData, profilePhoto: data.url });
          setSuccessMsg('Photo uploaded! Click save to update your profile.');
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          const data = await res.json();
          setErrorMsg(data.error || 'Failed to upload photo');
        }
      } catch (err) {
        setErrorMsg('Network error while uploading photo');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/agent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Network error while saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-cyan-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full ">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-500 mt-2">Manage your public information visible to your assigned students.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {successMsg}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-10 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Photo Section */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-slate-100 pb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-28 w-28 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-md relative">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 text-cyan-600 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full text-white shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
                  <Camera className="h-4 w-4" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-bold text-slate-800 text-lg">Profile Photo</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Upload a professional photo. We recommend a square image under 5MB for the best display on the student dashboard.
                </p>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title / Position</label>
                <input
                  type="text"
                  placeholder="e.g., Senior Education Consultant"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g., UK & Canada Admissions"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-b border-slate-100 pb-8">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Professional Biography</label>
              <textarea
                rows={5}
                placeholder="Share your experience, approach to consulting, and how you help students achieve their goals."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-emerald-600/10 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving Changes...' : 'Save Profile Settings'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

