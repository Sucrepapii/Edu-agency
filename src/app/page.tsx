'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Users, FileText, BarChart3, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-red-500" />
            <span className="font-bold text-xl tracking-tight text-slate-800">EduAgent<span className="text-red-500">Portal</span></span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-slate-600 hover:text-red-500 font-medium transition-colors text-sm px-3 py-2 rounded-md">
              Login
            </Link>
            <Link href="/register" className="bg-red-650 hover:bg-red-700 text-white font-medium transition-colors text-sm px-4 py-2 rounded-md shadow-sm">
              Start Your Application
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent opacity-70 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="inline-flex items-center rounded-full bg-red-400/10 px-3 py-1 text-sm font-medium text-red-300 ring-1 ring-inset ring-red-400/20">
            Next Generation Agency Portal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Your Education Journey, <span className="text-red-500">Managed in One Place</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Submit your application, upload documents, communicate with your education agent, and track your progress from start to finish.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 group">
              Start Your Application
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-medium px-6 py-3 rounded-lg transition-all">
              Login to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How It Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-light">Follow our simple six-step process to transition your international study goals into reality.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create Account', desc: 'Register as a student in your preferred agency in under 2 minutes.' },
            { step: '2', title: 'Submit Application', desc: 'Fill out our details-oriented, multi-step online application form.' },
            { step: '3', title: 'Get Assigned an Agent', desc: 'An expert education counselor is assigned to guide you.' },
            { step: '4', title: 'Upload Documents', desc: 'Drag-and-drop secure passport, transcripts, and financial files.' },
            { step: '5', title: 'Track Progress', desc: 'Real-time status updates and stage indicators on your portal.' },
            { step: '6', title: 'Complete Application', desc: 'Obtain university offers and study visa approvals.' },
          ].map((item, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative group hover:border-cyan-300 transition-all">
              <span className="absolute -top-4 -left-4 w-10 h-10 rounded-lg bg-cyan-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {item.step}
              </span>
              <div className="mt-2 space-y-2">
                <h3 className="font-semibold text-lg text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Split Panels */}
      <section className="bg-white border-y border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* For Students Card */}
          <div className="space-y-6 bg-slate-50 border border-slate-100 rounded-2xl p-8 lg:p-10">
            <div className="flex items-center space-x-3">
              <span className="p-3 bg-cyan-100 text-cyan-700 rounded-xl">
                <GraduationCap className="h-6 w-6" />
              </span>
              <h2 className="text-2xl font-bold text-slate-900">For Students</h2>
            </div>
            <p className="text-slate-600 font-light">Take total control of your university admission journey from any device.</p>
            <ul className="space-y-4">
              {[
                { title: 'Secure document uploads', desc: 'Authenticated file manager ensures private files are only visible to authorized counselors.' },
                { title: 'Dedicated education agent', desc: 'Get direct access to experienced counselors committed to your academic success.' },
                { title: 'Application tracking', desc: 'Visual timeline with 12 sequential application stages so you are always updated.' },
                { title: 'Real-time updates', desc: 'In-app notification badges alert you to document status updates instantly.' },
                { title: 'Secure communication', desc: 'Integrated chat interface lets you ask questions and attach documents directly.' },
              ].map((f, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">{f.title}</h4>
                    <p className="text-slate-500 text-xs font-light">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* For Agencies Card */}
          <div className="space-y-6 bg-slate-900 text-white rounded-2xl p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent opacity-60 pointer-events-none"></div>
            <div className="flex items-center space-x-3 relative z-10">
              <span className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Users className="h-6 w-6" />
              </span>
              <h2 className="text-2xl font-bold">For Agencies</h2>
            </div>
            <p className="text-slate-400 font-light relative z-10">Accelerate conversion and manage workflows in a secure multi-tenant SaaS environment.</p>
            <ul className="space-y-4 relative z-10">
              {[
                { title: 'Manage students', desc: 'Filter, search, and manage student rosters, applications, and documents efficiently.' },
                { title: 'Assign agents', desc: 'Admin assignment or Agent self-claiming with concurrency locks built-in.' },
                { title: 'Track applications', desc: 'Update progress percentages and review required document checklists.' },
                { title: 'Review documents', desc: 'Review, approve, or mark resubmission required with custom feedback.' },
                { title: 'Manage teams', desc: 'Add new consultants, edit agent profiles, and monitor counselor workload.' },
                { title: 'Multi-tenant architecture', desc: 'Total data isolation at database/backend level secures all tenant boundaries.' },
              ].map((f, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{f.title}</h4>
                    <p className="text-slate-400 text-xs font-light">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 text-center max-w-5xl mx-auto px-4">
        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-8">
          Enterprise Security & Storage Compliance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center items-center">
          <div className="flex flex-col items-center space-y-2">
            <Shield className="h-10 w-10 text-slate-400" />
            <h4 className="font-semibold text-slate-800 text-sm">Strict Data Isolation</h4>
            <p className="text-xs text-slate-500 font-light">Cross-tenant boundaries are validated at database query layer.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <FileText className="h-10 w-10 text-slate-400" />
            <h4 className="font-semibold text-slate-800 text-sm">Secure Cloud Storage</h4>
            <p className="text-xs text-slate-500 font-light">Secure Cloudinary storage streams files privately via authenticated routes.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <BarChart3 className="h-10 w-10 text-slate-400" />
            <h4 className="font-semibold text-slate-800 text-sm">Audit Trails</h4>
            <p className="text-xs text-slate-500 font-light">Every assignment, status update, and review action is logged.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 text-white">
            <GraduationCap className="h-6 w-6 text-cyan-400" />
            <span className="font-bold text-lg tracking-tight">EduAgent</span>
          </div>
          <p className="text-sm font-light">&copy; {new Date().getFullYear()} EduAgent SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
