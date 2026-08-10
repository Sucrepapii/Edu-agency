'use client';

import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Check, Clock, User, ClipboardList, Send, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STAGES = [
  'SUBMITTED',
  'AGENT_ASSIGNED',
  'DOCUMENTS_REQUIRED',
  'DOCUMENTS_UNDER_REVIEW',
  'DOCUMENTS_APPROVED',
  'SCHOOL_SELECTION',
  'APPLICATION_SUBMITTED_TO_SCHOOL',
  'OFFER_RECEIVED',
  'ADMISSION_CONFIRMED',
  'VISA_PROCESSING',
  'VISA_APPROVED',
  'COMPLETED',
];

const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: 'Application Submitted',
  AGENT_ASSIGNED: 'Agent Assigned',
  DOCUMENTS_REQUIRED: 'Documents Required',
  DOCUMENTS_UNDER_REVIEW: 'Documents Under Review',
  DOCUMENTS_APPROVED: 'Documents Approved',
  SCHOOL_SELECTION: 'School Selection',
  APPLICATION_SUBMITTED_TO_SCHOOL: 'Application Submitted to School',
  OFFER_RECEIVED: 'Offer Received',
  ADMISSION_CONFIRMED: 'Admission Confirmed',
  VISA_PROCESSING: 'Visa Processing',
  VISA_APPROVED: 'Visa Approved',
  COMPLETED: 'Completed',
};

export default function StudentDashboard() {
  const { user, loading, logout } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const app = user.studentProfile?.application;
  const agent = user.studentProfile?.assignedAgent;

  // Find index of current stage
  const currentStageIndex = app ? STAGES.indexOf(app.status) : -1;
  const progressPercent = app ? app.progressPercentage : 8;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}!</h1>
            <p className="text-slate-500 font-light mt-1">
              {!app 
                ? 'Your application has not yet been started.' 
                : currentStageIndex <= 0
                ? 'Your application has been created. Complete your form to submit it.'
                : `Your application is in progress. Currently: ${STAGE_LABELS[app.status]}`}
            </p>
          </div>
          
          {!app ? (
            <Link
              href="/dashboard/student/application"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-red-650/10 transition-all flex items-center gap-2 group"
            >
              Start Application
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : currentStageIndex <= 0 ? (
            <Link
              href="/dashboard/student/application"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-red-650/10 transition-all flex items-center gap-2"
            >
              Complete Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <ClipboardList className="h-10 w-10 text-cyan-600" />
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Application Status</p>
                <p className="font-bold text-slate-800">{STAGE_LABELS[app.status]}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Tracker (Section 12 & 18) */}
        {app && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Application Progress</h2>
              <span className="text-cyan-600 font-bold text-lg bg-cyan-50 px-3 py-1 rounded-full">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Visual Steps Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isActive = idx === currentStageIndex;
                const isPending = idx > currentStageIndex;

                let iconColor = 'bg-slate-100 text-slate-400 border-slate-200';
                let textColor = 'text-slate-400 font-light';

                if (isCompleted) {
                  iconColor = 'bg-cyan-500 text-white border-cyan-500';
                  textColor = 'text-slate-600 font-medium';
                } else if (isActive) {
                  iconColor = 'bg-white text-cyan-600 border-cyan-500 border-2 shadow-md shadow-cyan-500/20';
                  textColor = 'text-slate-900 font-bold';
                }

                return (
                  <div key={stage} className="flex items-center space-x-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${iconColor}`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : isActive ? (
                        <Clock className="h-4 w-4 animate-pulse" />
                      ) : (
                        <span className="text-xs">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm ${textColor} leading-tight`}>{STAGE_LABELS[stage]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agent Info Card (Section 13) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-md mb-4">Your Assigned Agent</h3>
            {agent ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={agent.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'} 
                      alt={agent.user.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{agent.user.name}</h4>
                    <p className="text-xs text-slate-400 font-light">{agent.position || 'Education Agent'}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/student/messages"
                  className="w-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-medium py-2 rounded-lg text-center text-sm block transition-all"
                >
                  Send Message
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <User className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Awaiting Agent Assignment</p>
                <p className="text-xs text-slate-400 font-light">An agent will be assigned to review your file shortly.</p>
              </div>
            )}
          </div>

          {/* Documents Status Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-md mb-4">Required Documents</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-light">Passport Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-600">
                  Required
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-light">Transcripts Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  Pending
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/student/documents"
              className="w-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-medium py-2 rounded-lg text-center text-sm block transition-all mt-4"
            >
              Upload Documents
            </Link>
          </div>

          {/* Quick Communication Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-md mb-4">Portal Communications</h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Have questions about visa details, budgets, or intakes? Chat directly with your counselor.
            </p>
            <Link
              href="/dashboard/student/messages"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg text-center text-sm block transition-all shadow-sm hover:shadow-cyan-600/10 mt-4"
            >
              Open Messaging Hub
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
