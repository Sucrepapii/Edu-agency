'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { showToast } = useToast();

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
        showToast('Welcome back!', `Signed in as ${data.user?.name || email}`, 'success');
        router.refresh();
        router.push(redirect);
      } else {
        const msg = data.error || 'Authentication failed.';
        setError(msg);
        showToast('Login Failed', msg, 'error');
      }
    } catch (err) {
      const msg = 'Connection failed. Please try again.';
      setError(msg);
      showToast('Connection Error', msg, 'error');
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
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Trust & Marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center space-x-2 text-white">
            <img src="/logo.png" alt="EduAgent" className="h-16 w-16 object-contain" />
            <span className="font-bold text-2xl tracking-tight">EduAgent</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-white leading-snug">
            Your bridge to world-class education.
          </h1>
          <ul className="space-y-4 text-slate-300 font-light">
            <li className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-1.5 rounded-full"><CheckCircle className="w-4 h-4 text-cyan-400" /></div>
              Trusted by 10,000+ ambitious students
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-1.5 rounded-full"><CheckCircle className="w-4 h-4 text-cyan-400" /></div>
              Seamless document processing
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-1.5 rounded-full"><CheckCircle className="w-4 h-4 text-cyan-400" /></div>
              Direct access to expert counselors
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative">
        <Link href="/" className="absolute top-8 left-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-650 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm font-light">
              Don't have an account?{' '}
              <Link href="/register" className="text-red-650 hover:text-red-500 font-medium">
                Register here
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-red-600 hover:text-red-500 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Demo Accounts Panel */}
          <div className="pt-8 mt-8 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Quick Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button type="button" onClick={() => handleQuickLogin('superadmin@platform.com')} className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-3 rounded-xl text-left transition-all cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-red-700">Super Admin</p>
              </button>
              <button type="button" onClick={() => handleQuickLogin('admin1@globaledu.com')} className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-3 rounded-xl text-left transition-all cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-red-700">Agency Admin</p>
              </button>
              <button type="button" onClick={() => handleQuickLogin('sarah.j@globaledu.com')} className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-3 rounded-xl text-left transition-all cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-red-700">Agent</p>
              </button>
              <button type="button" onClick={() => handleQuickLogin('john.doe@gmail.com')} className="border border-slate-200 hover:border-red-500 hover:bg-red-50/50 p-3 rounded-xl text-left transition-all cursor-pointer group">
                <p className="font-bold text-slate-800 group-hover:text-red-700">Student</p>
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
