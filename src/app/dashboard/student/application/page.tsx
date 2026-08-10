'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentApplicationForm() {
  const { user, loading, logout, mutate } = useUser();
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [highestQualification, setHighestQualification] = useState('');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [gpa, setGpa] = useState('');

  const [prefCountry, setPrefCountry] = useState('');
  const [prefSchool, setPrefSchool] = useState('');
  const [prefCourse, setPrefCourse] = useState('');
  const [prefIntake, setPrefIntake] = useState('');
  const [budget, setBudget] = useState('');

  const [additionalInfo, setAdditionalInfo] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-populate fields on mount
  useEffect(() => {
    if (user?.studentProfile?.application) {
      const app = user.studentProfile.application;
      setFullName(app.fullName || user.name || '');
      setDob(app.dob || '');
      setGender(app.gender || '');
      setNationality(app.nationality || '');
      setPhone(app.phone || user.phone || '');
      setEmail(app.email || user.email || '');
      setAddress(app.address || '');

      setHighestQualification(app.highestQualification || '');
      setInstitution(app.institution || '');
      setCourse(app.course || '');
      setGraduationYear(app.graduationYear ? app.graduationYear.toString() : '');
      setGpa(app.gpa || '');

      setPrefCountry(app.prefCountry || '');
      setPrefSchool(app.prefSchool || '');
      setPrefCourse(app.prefCourse || '');
      setPrefIntake(app.prefIntake || '');
      setBudget(app.budget || '');

      setAdditionalInfo(app.additionalInfo || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const saveApplication = async (isSubmitted = false) => {
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/student/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, dob, gender, nationality, phone, email, address,
          highestQualification, institution, course, graduationYear, gpa,
          prefCountry, prefSchool, prefCourse, prefIntake, budget,
          additionalInfo,
          isSubmitted,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(isSubmitted ? 'Application submitted successfully!' : 'Draft saved successfully.');
        await mutate(); // Refresh session data
        if (isSubmitted) {
          setTimeout(() => {
            router.push('/dashboard/student');
          }, 1500);
        }
      } else {
        setErrorMsg(data.error || 'Failed to save application.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        
        {/* Back Link */}
        <Link href="/dashboard/student" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Application Form</h1>
            <p className="text-slate-500 text-sm font-light mt-1">Please provide complete and accurate information.</p>
          </div>
          <button
            onClick={() => saveApplication(false)}
            disabled={saving}
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {[
            { stepNum: 1, label: 'Personal Information' },
            { stepNum: 2, label: 'Education Background' },
            { stepNum: 3, label: 'Study Preferences' },
            { stepNum: 4, label: 'Additional Information' },
          ].map((s) => (
            <button
              key={s.stepNum}
              onClick={() => setStep(s.stepNum)}
              className="flex items-center space-x-2 text-left shrink-0 focus:outline-none"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${
                  step === s.stepNum
                    ? 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-600/10'
                    : step > s.stepNum
                    ? 'bg-cyan-100 border-cyan-100 text-cyan-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {s.stepNum}
              </div>
              <span
                className={`hidden md:inline text-xs font-semibold uppercase tracking-wider ${
                  step === s.stepNum ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Messaging banners */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm shadow-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
          
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Step 1: Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nationality</label>
                  <input
                    type="text"
                    placeholder="Nigeria"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-4 py-2.5 outline-none text-sm cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residential Address</label>
                  <input
                    type="text"
                    placeholder="123 Street Address, Lagos"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education Background */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Step 2: Education Background</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="High School Diploma, Bachelor of Science, etc."
                    value={highestQualification}
                    onChange={(e) => setHighestQualification(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Name</label>
                  <input
                    type="text"
                    placeholder="University of West Africa"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course / Major</label>
                  <input
                    type="text"
                    placeholder="Science & Math"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Graduation Year</label>
                  <input
                    type="number"
                    placeholder="2024"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative GPA / Grade</label>
                  <input
                    type="text"
                    placeholder="3.8 / 4.0 or Upper Second Class"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Study Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Step 3: Study Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Country</label>
                  <input
                    type="text"
                    placeholder="Canada, United Kingdom, USA"
                    value={prefCountry}
                    onChange={(e) => setPrefCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred School (If any)</label>
                  <input
                    type="text"
                    placeholder="University of Toronto"
                    value={prefSchool}
                    onChange={(e) => setPrefSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Course / Program</label>
                  <input
                    type="text"
                    placeholder="MSc Data Science"
                    value={prefCourse}
                    onChange={(e) => setPrefCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Intake</label>
                  <input
                    type="text"
                    placeholder="September 2027"
                    value={prefIntake}
                    onChange={(e) => setPrefIntake(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yearly Budget Range</label>
                  <input
                    type="text"
                    placeholder="$25,000 - $30,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Additional Information */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Step 4: Additional Information</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional details or comments</label>
                <textarea
                  rows={6}
                  placeholder="Tell us more about your background, career goals, or specific visa questions."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-3 outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-8">
            <button
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(prev => Math.min(4, prev + 1))}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-cyan-600/10 cursor-pointer"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => saveApplication(true)}
                disabled={saving}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Submit Application'}
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
