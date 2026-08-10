'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, GraduationCap, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Check your email for a reset link.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to request password reset.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error occurred.');
    }
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
            <GraduationCap className="h-10 w-10 text-cyan-400" />
            <span className="font-bold text-2xl tracking-tight">EduAgent</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-white leading-snug">
            Securely recover your account.
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

      {/* Right Column: Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative py-12">
        <Link href="/login" className="absolute top-8 left-8 lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-650 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recover your account</h2>
            <p className="text-slate-500 text-sm font-light">
              Remember your password?{' '}
              <Link href="/login" className="text-red-650 hover:text-red-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {status === 'success' ? (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
              <p className="text-slate-500">{message}</p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start space-x-2 text-sm">
                  <span>{message}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </button>
              
              <div className="text-center pt-2">
                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
