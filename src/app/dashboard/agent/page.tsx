'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Users, FileText, ClipboardList, CheckCircle, FileWarning } from 'lucide-react';
import Link from 'next/link';

export default function AgentDashboard() {
  const { user, loading, logout } = useUser();
  const [stats, setStats] = useState({
    myStudents: 0,
    newDocuments: 0,
    docsAwaitingReview: 0,
    activeApps: 0,
    completedApps: 0,
  });

  useEffect(() => {
    if (user?.agentProfile?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Fetch students assigned to this agent
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        // Find current logged in agent profile inside the list
        const myProfile = data.agents.find((a: any) => a.id === user?.agentProfile?.id);
        if (myProfile) {
          const myStudentsList = myProfile.students || [];
          
          let docsAwaitingReview = 0;
          let newDocuments = 0;
          let activeApps = 0;
          let completedApps = 0;

          myStudentsList.forEach((st: any) => {
            // Count document reviews
            const docs = st.documents || [];
            docs.forEach((d: any) => {
              if (d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED') {
                docsAwaitingReview++;
              }
              // If uploaded in past 24 hours, count as new
              if (d.uploadedAt && Date.now() - new Date(d.uploadedAt).getTime() < 24 * 3600 * 1000) {
                newDocuments++;
              }
            });

            // Count application states
            const app = st.application;
            if (app) {
              if (app.status === 'COMPLETED') {
                completedApps++;
              } else {
                activeApps++;
              }
            }
          });

          setStats({
            myStudents: myStudentsList.length,
            newDocuments,
            docsAwaitingReview,
            activeApps,
            completedApps,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load agent stats:', err);
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
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div>
            <span className="bg-cyan-50 text-cyan-700 font-semibold px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider">
              {user.agentProfile?.position || 'Education Advisor'}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Agent Dashboard</h1>
            <p className="text-slate-500 font-light mt-1">Review student applications, manage document checklists, and coordinate placements.</p>
          </div>
          {user.agency?.assignmentMode === 'ADMIN_AND_CLAIM' && (
            <Link
              href="/dashboard/agent/claim"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-3 rounded-lg shadow-md hover:shadow-cyan-600/10 transition-all text-sm shrink-0"
            >
              Claim Available Students
            </Link>
          )}
        </div>

        {/* Dashboard Stats Cards (Section 10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'My Students', value: stats.myStudents, icon: Users, color: 'text-cyan-600 bg-cyan-50 border-cyan-100', link: '/dashboard/agent/students' },
            { label: 'New Documents', value: stats.newDocuments, icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', link: '/dashboard/agent/students' },
            { label: 'Docs Awaiting Review', value: stats.docsAwaitingReview, icon: FileWarning, color: 'text-amber-600 bg-amber-50 border-amber-100', link: '/dashboard/agent/students' },
            { label: 'Active Applications', value: stats.activeApps, icon: ClipboardList, color: 'text-blue-600 bg-blue-50 border-blue-100', link: '/dashboard/agent/students' },
            { label: 'Completed Cases', value: stats.completedApps, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', link: '/dashboard/agent/students' },
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

        {/* Info panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Working Guidelines */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Advisor Core Guidelines</h3>
            <ul className="space-y-3 text-sm font-light text-slate-600">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></span>
                <span>Review uploaded document files within 24 hours of submission.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></span>
                <span>Provide clear comments and requirements when requesting document resubmissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-2 shrink-0"></span>
                <span>Direct message students to answer intake, course structure, and visa questions.</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <Link href="/dashboard/agent/students" className="border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/20 p-3 rounded-lg text-center transition-all">
                Manage Assigned Students
              </Link>
              {user.agency?.assignmentMode === 'ADMIN_AND_CLAIM' ? (
                <Link href="/dashboard/agent/claim" className="border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/20 p-3 rounded-lg text-center transition-all">
                  Claim Unassigned Students
                </Link>
              ) : (
                <span className="border border-slate-200 opacity-50 p-3 rounded-lg text-center cursor-not-allowed">
                  Claim Students (Disabled)
                </span>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
