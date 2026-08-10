'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success
        router.refresh();
        router.push(redirect);
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper
  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-650 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 text-red-650">
            <GraduationCap className="h-10 w-10 text-red-500" />
            <span className="font-bold text-2xl tracking-tight text-slate-800">EduAgent</span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Sign in to your portal</h2>
          <p className="text-slate-500 text-sm font-light">
            Or{' '}
            <Link href="/register" className="text-red-650 hover:text-red-500 font-medium">
              register as a new student
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 rounded-lg pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 rounded-lg pl-10 pr-4 py-2.5 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-red-650/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white px-2 relative -top-3">
              Quick Demo Accounts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('superadmin@platform.com')}
              className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-2.5 rounded-lg text-left transition-all cursor-pointer group"
            >
              <p className="font-bold text-slate-800 group-hover:text-red-750">Super Admin</p>
              <p className="text-slate-400">Platform controller</p>
            </button>

            <button
              onClick={() => handleQuickLogin('admin1@globaledu.com')}
              className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-2.5 rounded-lg text-left transition-all cursor-pointer group"
            >
              <p className="font-bold text-slate-800 group-hover:text-red-750">Agency Admin</p>
              <p className="text-slate-400">Global Edu (Claim enabled)</p>
            </button>

            <button
              onClick={() => handleQuickLogin('sarah.j@globaledu.com')}
              className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-2.5 rounded-lg text-left transition-all cursor-pointer group"
            >
              <p className="font-bold text-slate-800 group-hover:text-red-750">Education Agent</p>
              <p className="text-slate-400">Sarah Johnson (Agency 1)</p>
            </button>

            <button
              onClick={() => handleQuickLogin('john.doe@gmail.com')}
              className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-2.5 rounded-lg text-left transition-all cursor-pointer group"
            >
              <p className="font-bold text-slate-800 group-hover:text-red-750">Assigned Student</p>
              <p className="text-slate-400">John Doe (Nigeria CS)</p>
            </button>

            <button
              onClick={() => handleQuickLogin('peter.adams@gmail.com')}
              className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-2.5 rounded-lg text-left transition-all cursor-pointer group"
            >
              <p className="font-bold text-slate-800 group-hover:text-red-750">Unassigned Student</p>
              <p className="text-slate-400">Peter Adams (Ghana Mech)</p>
            </button>

            <button
              onClick={() => handleQuickLogin('admin2@studyexperts.com')}
              className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-2.5 rounded-lg text-left transition-all cursor-pointer group"
            >
              <p className="font-bold text-slate-800 group-hover:text-red-750">Agency Admin 2</p>
              <p className="text-slate-400">Study Experts (Claim disabled)</p>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
