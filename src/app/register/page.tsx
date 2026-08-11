'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, User, Mail, Phone, Lock, Calendar, AlertCircle, ArrowLeft, Globe, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [dob, setDob] = useState('');
  const [agencyId, setAgencyId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Load agencies on mount
  useEffect(() => {
    async function loadAgencies() {
      try {
        const res = await fetch('/api/public/agencies');
        if (res.ok) {
          const data = await res.json();
          setAgencies(data.agencies || []);
          if (data.agencies && data.agencies.length > 0) {
            setAgencyId(data.agencies[0].id); // Select first by default
          }
        }
      } catch (err) {
        console.error('Failed to load agencies:', err);
      }
    }
    loadAgencies();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !country || !dob || !agencyId) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          country,
          dob,
          agencyId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success
        router.refresh();
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
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
            <img src="/logo.png" alt="EduAgent" className="h-10 w-10 object-contain" />
            <span className="font-bold text-2xl tracking-tight">EduAgent</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-white leading-snug">
            Start your global education journey.
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

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative py-12">
        <Link href="/" className="absolute top-8 left-8 lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-650 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create student account</h2>
            <p className="text-slate-500 text-sm font-light">
              Already have an account?{' '}
              <Link href="/login" className="text-red-650 hover:text-red-500 font-medium">
                Sign in
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

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Select Agency *</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <select
                  required
                  value={agencyId}
                  onChange={(e) => setAgencyId(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm appearance-none"
                >
                  <option value="">-- Choose an Agency --</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Country *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nigeria"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">DOB *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-sm shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-red-600/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
