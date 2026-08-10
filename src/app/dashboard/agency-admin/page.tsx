'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Users, FileWarning, ClipboardCheck, ClipboardList, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AgencyAdminDashboard() {
  const { user, loading, logout } = useUser();
  const [stats, setStats] = useState({
    totalStudents: 0,
    unassignedStudents: 0,
    activeApps: 0,
    docsAwaitingReview: 0,
    completedApps: 0,
  });

  useEffect(() => {
    if (user?.agencyId) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // We can fetch agents (which has nested students list)
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        
        let totalStudents = 0;
        let unassignedStudents = 0;
        let activeApps = 0;
        let docsAwaitingReview = 0;
        let completedApps = 0;

        // In our mock DB setup, we can fetch all students for the agency.
        // Let's call another API or calculate from data.
        // In this endpoint `/api/admin/agents`, does it return all agents? Yes.
        // How do we fetch all students including unassigned?
        // Let's call `/api/agent/unassigned` to get unassigned list, and query agent student rosters for the rest!
        // That is a perfect way to aggregate!
        const unassignedRes = await fetch('/api/agent/unassigned');
        let unassignedList = [];
        if (unassignedRes.ok) {
          const unassignedData = await unassignedRes.json();
          unassignedList = unassignedData.students || [];
          unassignedStudents = unassignedList.length;
        }

        const agents = data.agents || [];
        agents.forEach((ag: any) => {
          const roster = ag.students || [];
          totalStudents += roster.length;
          
          roster.forEach((st: any) => {
            const docs = st.documents || [];
            docs.forEach((d: any) => {
              if (d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED') {
                docsAwaitingReview++;
              }
            });

            const app = st.application;
            if (app) {
              if (app.status === 'COMPLETED') {
                completedApps++;
              } else {
                activeApps++;
              }
            }
          });
        });

        // Add unassigned students to the total
        totalStudents += unassignedStudents;
        
        unassignedList.forEach((st: any) => {
          const app = st.application;
          if (app) {
            activeApps++;
          }
        });

        setStats({
          totalStudents,
          unassignedStudents,
          activeApps,
          docsAwaitingReview,
          completedApps,
        });
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
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
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.agency?.name || 'Agency Portal'}</h1>
            <p className="text-slate-500 font-light mt-1">Agency Owner Administration Panel. Monitor metrics and counselor workload.</p>
          </div>
          <Link
            href="/dashboard/agency-admin/queue"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-3 rounded-lg shadow-md hover:shadow-cyan-600/10 transition-all text-sm shrink-0"
          >
            Review Student Queue ({stats.unassignedStudents})
          </Link>
        </div>

        {/* Dashboard Metrics (Section 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-cyan-600 bg-cyan-50 border-cyan-100', link: '/dashboard/agency-admin/queue' },
            { label: 'Unassigned Students', value: stats.unassignedStudents, icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-100', link: '/dashboard/agency-admin/queue' },
            { label: 'Active Applications', value: stats.activeApps, icon: ClipboardList, color: 'text-blue-600 bg-blue-50 border-blue-100', link: '/dashboard/agency-admin/queue' },
            { label: 'Docs Awaiting Review', value: stats.docsAwaitingReview, icon: FileWarning, color: 'text-amber-600 bg-amber-50 border-amber-100', link: '/dashboard/agency-admin/queue' },
            { label: 'Completed Cases', value: stats.completedApps, icon: ClipboardCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', link: '/dashboard/agency-admin/queue' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                href={card.link}
                className="bg-white border border-slate-200 hover:border-cyan-300 rounded-2xl p-5 shadow-sm space-y-4 transition-all block group"
              >
                <div className={`p-3 rounded-xl border w-fit ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{card.value}</p>
                  <p className="text-xs text-slate-500 font-light mt-1">{card.label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* System Settings & Actions Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Administrative Actions</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <Link href="/dashboard/agency-admin/agents" className="border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/20 p-4 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-2">
                <Users className="h-5 w-5 text-cyan-600" />
                Manage Team
              </Link>
              <Link href="/dashboard/agency-admin/queue" className="border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/20 p-4 rounded-xl text-center transition-all flex flex-col items-center justify-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                Assign Queue
              </Link>
            </div>
          </div>

          {/* Quick settings review */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Assignment Configuration</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-light text-slate-600">
                <span>Current Mode:</span>
                <span className="font-semibold text-slate-850 bg-slate-100 px-3 py-1 rounded-full text-xs">
                  {user.agency?.assignmentMode === 'ADMIN_AND_CLAIM' ? 'Admin + Agent Claim' : 'Admin Assignment Only'}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                You can toggle Student Assignment Mode inside Settings. Enabling Agent Claim allows unassigned students to be self-claimed by consultants.
              </p>
              <Link href="/dashboard/agency-admin/settings" className="text-cyan-600 hover:text-cyan-500 text-xs font-semibold inline-flex items-center gap-1">
                Configure Settings
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
