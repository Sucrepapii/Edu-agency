'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit mx-auto shadow-sm">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500 text-sm font-light leading-relaxed">
            Unauthorized. You don't have permission to access this application or tenant resource.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow-sm hover:shadow-cyan-600/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
