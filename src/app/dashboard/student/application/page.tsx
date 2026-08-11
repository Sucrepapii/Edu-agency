'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { COUNTRIES, QUALIFICATIONS, PROGRAM_CATEGORIES, YEARS } from '@/lib/constants';

const getSelectStyles = (isError: boolean = false) => ({
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#f8fafc',
    borderColor: isError ? '#ef4444' : (state.isFocused ? '#06b6d4' : '#e2e8f0'),
    boxShadow: state.isFocused ? (isError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px rgba(6, 182, 212, 0.2)') : 'none',
    borderRadius: '0.5rem',
    padding: '0.15rem',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#06b6d4' : state.isFocused ? '#ecfeff' : 'white',
    color: state.isSelected ? 'white' : '#334155',
    fontSize: '0.875rem',
    cursor: 'pointer',
  }),
});

const customSelectStyles = getSelectStyles(false);

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

  const [educations, setEducations] = useState<any[]>([{ highestQualification: '', institution: '', course: '', graduationYear: '', gpa: '' }]);
  const [studyPreferences, setStudyPreferences] = useState<any[]>([{ prefCountry: '', prefSchool: '', prefCourse: '', prefIntake: '', budget: '' }]);

  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Load Institution Options dynamically from API proxy
  const loadInstitutionOptions = async (inputValue: string, country?: string) => {
    try {
      let url = `/api/universities?name=${encodeURIComponent(inputValue || 'University')}`;
      if (country) {
        url += `&country=${encodeURIComponent(country)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      return data.slice(0, 50).map((uni: any) => ({
        value: uni.name,
        label: uni.name
      }));
    } catch (e) {
      console.error('Failed to fetch universities', e);
      return [];
    }
  };

  // Pre-populate fields on mount
  useEffect(() => {
    if (user?.studentProfile?.application) {
      const app = user.studentProfile.application as any;
      setFullName(app.fullName || user.name || '');
      setDob(app.dob || '');
      setGender(app.gender || '');
      setNationality(app.nationality || '');
      setPhone(app.phone || user.phone || '');
      setEmail(app.email || user.email || '');
      setAddress(app.address || '');

      // Load Educations (JSON or fallback to legacy)
      if (app.educations && Array.isArray(app.educations) && app.educations.length > 0) {
        setEducations(app.educations);
      } else if (app.institution || app.highestQualification) {
        setEducations([{
          highestQualification: app.highestQualification || '',
          institution: app.institution || '',
          course: app.course || '',
          graduationYear: app.graduationYear ? app.graduationYear.toString() : '',
          gpa: app.gpa || ''
        }]);
      }

      // Load Preferences (JSON or fallback to legacy)
      if (app.studyPreferences && Array.isArray(app.studyPreferences) && app.studyPreferences.length > 0) {
        setStudyPreferences(app.studyPreferences);
      } else if (app.prefCountry || app.prefSchool) {
        setStudyPreferences([{
          prefCountry: app.prefCountry || '',
          prefSchool: app.prefSchool || '',
          prefCourse: app.prefCourse || '',
          prefIntake: app.prefIntake || '',
          budget: app.budget || ''
        }]);
      }

      setAdditionalInfo(app.additionalInfo || '');
      if (app.status === 'SUBMITTED' || app.status === 'REVIEW' || app.status === 'APPROVED') {
        setIsSubmitted(true);
      }
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

  const saveApplication = async (submitStatus = false) => {
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Basic Validation if submitting
      if (submitStatus) {
        if (!fullName || !dob || !gender || !nationality || !phone) {
          setErrorMsg('Please fill in all mandatory fields in Step 1.');
          setSaving(false);
          return;
        }
        for (const edu of educations) {
          if (!edu.highestQualification || !edu.institution || !edu.course || !edu.graduationYear) {
            setErrorMsg('Please fill in all mandatory fields in your Education Background.');
            setSaving(false);
            return;
          }
        }
        for (const pref of studyPreferences) {
          if (!pref.prefCountry || !pref.prefCourse) {
            setErrorMsg('Please fill in at least Country and Course for all Study Preferences.');
            setSaving(false);
            return;
          }
        }
      }

      const res = await fetch('/api/student/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, dob, gender, nationality, phone, email, address,
          educations,
          studyPreferences,
          additionalInfo,
          isSubmitted: submitStatus, // whether to transition to SUBMITTED state
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(submitStatus ? 'Application submitted successfully!' : 'Draft saved successfully.');
        setIsSubmitted(submitStatus || isSubmitted);
        await mutate(); // Refresh session data
        if (submitStatus) {
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

  const canAccessStep = (targetStep: number) => {
    if (targetStep === 1) return true;
    const step1Valid = Boolean(fullName && dob && gender && nationality && phone);
    if (targetStep === 2) return step1Valid;
    const step2Valid = educations.every(edu => edu.highestQualification && edu.institution && edu.course && edu.graduationYear);
    if (targetStep === 3) return step1Valid && step2Valid;
    const step3Valid = studyPreferences.every(pref => pref.prefCountry && pref.prefCourse);
    if (targetStep === 4) return step1Valid && step2Valid && step3Valid;
    return false;
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setShowValidation(false);
      setStep(prev => Math.min(4, prev + 1));
    } else {
      setShowValidation(true);
      setErrorMsg("Please fill in all mandatory fields before proceeding.");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const canProceedToNextStep = () => {
    if (step === 1) return Boolean(fullName && dob && gender && nationality && phone && email && address);
    if (step === 2) return educations.every(edu => edu.highestQualification && edu.institution && edu.course && edu.graduationYear && edu.gpa);
    if (step === 3) return studyPreferences.every(pref => pref.prefCountry && pref.prefSchool && pref.prefCourse && pref.prefIntake && pref.budget);
    if (step === 4) return Boolean(additionalInfo);
    return false;
  };

  const handleSubmitApplication = () => {
    if (!canProceedToNextStep()) {
      setShowValidation(true);
      setErrorMsg("Please fill in all mandatory fields before submitting.");
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    saveApplication(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 w-full space-y-6 overflow-y-auto">
        
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
              onClick={() => {
                if (canAccessStep(s.stepNum)) setStep(s.stepNum);
              }}
              disabled={!canAccessStep(s.stepNum)}
              className={`flex items-center space-x-2 text-left shrink-0 focus:outline-none transition-opacity ${!canAccessStep(s.stepNum) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${showValidation && !fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                  <div className="relative">
                    <DatePicker
                      selected={dob ? new Date(dob) : null}
                      onChange={(date: Date | null) => setDob(date ? date.toISOString().split('T')[0] : '')}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      maxDate={new Date()}
                      placeholderText="YYYY-MM-DD"
                      className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 transition-all ${showValidation && !dob ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
                      wrapperClassName="w-full"
                    />
                    <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
                  <Select
                    options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other / Prefer not to say' }]}
                    value={gender ? { value: gender, label: gender } : null}
                    onChange={(selected: any) => setGender(selected?.value || '')}
                    isClearable
                    placeholder="Select gender..."
                    styles={getSelectStyles(showValidation && !gender)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nationality</label>
                  <Select
                    options={COUNTRIES.map(c => ({ value: c, label: c }))}
                    value={nationality ? { value: nationality, label: nationality } : null}
                    onChange={(selected: any) => setNationality(selected?.value || '')}
                    isClearable
                    placeholder="Search country..."
                    styles={getSelectStyles(showValidation && !nationality)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${showValidation && !phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
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
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${showValidation && !address ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education Background */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800">Step 2: Education Background</h3>
                <button
                  onClick={() => setEducations([...educations, { highestQualification: '', institution: '', course: '', graduationYear: '', gpa: '' }])}
                  className="text-xs bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add Education
                </button>
              </div>
              
              {educations.map((edu, index) => (
                <div key={index} className="space-y-6 pb-6 border-b border-slate-100 last:border-0 relative">
                  {educations.length > 1 && (
                    <button
                      onClick={() => setEducations(educations.filter((_, i) => i !== index))}
                      className="absolute right-0 top-0 text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qualification / Degree</label>
                      <Select
                        options={QUALIFICATIONS.map(q => ({ value: q, label: q }))}
                        value={edu.highestQualification ? { value: edu.highestQualification, label: edu.highestQualification } : null}
                        onChange={(selected: any) => {
                          const newEd = [...educations];
                          newEd[index].highestQualification = selected?.value || '';
                          setEducations(newEd);
                        }}
                        isClearable
                        placeholder="Select qualification..."
                        styles={getSelectStyles(showValidation && !edu.highestQualification)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Name</label>
                      <AsyncCreatableSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={(inputValue) => loadInstitutionOptions(inputValue)}
                        value={edu.institution ? { value: edu.institution, label: edu.institution } : null}
                        onChange={(selected: any) => {
                          const newEd = [...educations];
                          newEd[index].institution = selected?.value || '';
                          setEducations(newEd);
                        }}
                        isClearable
                        placeholder="Type to search worldwide institutions..."
                        styles={getSelectStyles(showValidation && !edu.institution)}
                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course of Study</label>
                      <CreatableSelect
                        options={PROGRAM_CATEGORIES.map(p => ({ value: p, label: p }))}
                        value={edu.course ? { value: edu.course, label: edu.course } : null}
                        onChange={(selected: any) => {
                          const newEd = [...educations];
                          newEd[index].course = selected?.value || '';
                          setEducations(newEd);
                        }}
                        isClearable
                        placeholder="Select or type course name..."
                        styles={getSelectStyles(showValidation && !edu.course)}
                        formatCreateLabel={(inputValue) => `Add custom course: "${inputValue}"`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grad. Year</label>
                        <Select
                          options={YEARS.map(y => ({ value: y, label: y }))}
                          value={edu.graduationYear ? { value: edu.graduationYear, label: edu.graduationYear } : null}
                          onChange={(selected: any) => {
                            const newEd = [...educations];
                            newEd[index].graduationYear = selected?.value || '';
                            setEducations(newEd);
                          }}
                          isClearable
                          placeholder="Year"
                          styles={getSelectStyles(showValidation && !edu.graduationYear)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative GPA</label>
                        <input
                          type="text"
                          placeholder="3.8 / 4.0"
                          value={edu.gpa}
                          onChange={(e) => {
                            const newEd = [...educations];
                            newEd[index].gpa = e.target.value;
                            setEducations(newEd);
                          }}
                          className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none transition-all text-sm focus:ring-2 ${showValidation && !edu.gpa ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: Study Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800">Step 3: Study Preferences</h3>
                <button
                  onClick={() => setStudyPreferences([...studyPreferences, { prefCountry: '', prefSchool: '', prefCourse: '', prefIntake: '', budget: '' }])}
                  className="text-xs bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add Preference
                </button>
              </div>
              
              {studyPreferences.map((pref, index) => (
                <div key={index} className="space-y-6 pb-6 border-b border-slate-100 last:border-0 relative">
                  {studyPreferences.length > 1 && (
                    <button
                      onClick={() => setStudyPreferences(studyPreferences.filter((_, i) => i !== index))}
                      className="absolute right-0 top-0 text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md"
                    >
                      Remove
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Country</label>
                      <Select
                        options={COUNTRIES.map(c => ({ value: c, label: c }))}
                        value={pref.prefCountry ? { value: pref.prefCountry, label: pref.prefCountry } : null}
                        onChange={(selected: any) => {
                          const newPref = [...studyPreferences];
                          newPref[index].prefCountry = selected?.value || '';
                          setStudyPreferences(newPref);
                        }}
                        isClearable
                        placeholder="Select country..."
                        styles={getSelectStyles(showValidation && !pref.prefCountry)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred School (If any)</label>
                      <AsyncCreatableSelect
                        key={pref.prefCountry || 'global'}
                        cacheOptions
                        defaultOptions
                        loadOptions={(inputValue) => loadInstitutionOptions(inputValue, pref.prefCountry)}
                        value={pref.prefSchool ? { value: pref.prefSchool, label: pref.prefSchool } : null}
                        onChange={(selected: any) => {
                          const newPref = [...studyPreferences];
                          newPref[index].prefSchool = selected?.value || '';
                          setStudyPreferences(newPref);
                        }}
                        isClearable
                        placeholder={pref.prefCountry ? `Search universities in ${pref.prefCountry}...` : "Search universities worldwide..."}
                        styles={getSelectStyles(showValidation && !pref.prefSchool)}
                        formatCreateLabel={(inputValue) => `Search for "${inputValue}"`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Course / Program</label>
                      <CreatableSelect
                        options={PROGRAM_CATEGORIES.map(p => ({ value: p, label: p }))}
                        value={pref.prefCourse ? { value: pref.prefCourse, label: pref.prefCourse } : null}
                        onChange={(selected: any) => {
                          const newPref = [...studyPreferences];
                          newPref[index].prefCourse = selected?.value || '';
                          setStudyPreferences(newPref);
                        }}
                        isClearable
                        placeholder="Select or type program..."
                        styles={getSelectStyles(showValidation && !pref.prefCourse)}
                        formatCreateLabel={(inputValue) => `Add custom program: "${inputValue}"`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preferred Intake</label>
                      <input
                        type="text"
                        placeholder="September 2027"
                        value={pref.prefIntake}
                        onChange={(e) => {
                          const newPref = [...studyPreferences];
                          newPref[index].prefIntake = e.target.value;
                          setStudyPreferences(newPref);
                        }}
                        className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none transition-all text-sm focus:ring-2 ${showValidation && !pref.prefIntake ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yearly Budget Range</label>
                      <input
                        type="text"
                        placeholder="$25,000 - $30,000"
                        value={pref.budget}
                        onChange={(e) => {
                          const newPref = [...studyPreferences];
                          newPref[index].budget = e.target.value;
                          setStudyPreferences(newPref);
                        }}
                        className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 outline-none transition-all text-sm focus:ring-2 ${showValidation && !pref.budget ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                  className={`w-full bg-slate-50 border rounded-lg px-4 py-3 outline-none transition-all text-sm resize-none focus:ring-2 ${showValidation && !additionalInfo ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20"}`}
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
                onClick={handleNextStep}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:shadow-cyan-600/10 cursor-pointer"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                disabled={saving}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-md hover:shadow-cyan-600/10 cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : isSubmitted ? 'Update Details' : 'Submit Application'}
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}

