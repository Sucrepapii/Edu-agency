'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Users, 
  FileText, 
  BarChart3, 
  GraduationCap, 
  Search, 
  Globe, 
  Clock, 
  Award, 
  Check, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';
import EligibilityBot from '@/components/EligibilityBot';

// Type definitions for country information
interface CountryDetail {
  name: string;
  flag: string;
  visaSuccess: string;
  processingTime: string;
  workPermit: string;
  topFields: string[];
  costEstimate: string;
}

export default function LandingPage() {
  // Tab states
  const [selectedCountry, setSelectedCountry] = useState<string>('Canada');
  
  // Stepper states
  const [degree, setDegree] = useState<string>('Master\'s');
  const [destination, setDestination] = useState<string>('Canada');
  const [englishTest, setEnglishTest] = useState<string>('IELTS');
  const [showResult, setShowResult] = useState<boolean>(false);

  // Country details dataset
  const countryDetails: Record<string, CountryDetail> = {
    Canada: {
      name: 'Canada',
      flag: '🇨🇦',
      visaSuccess: '98.2%',
      processingTime: '4 - 8 Weeks',
      workPermit: 'Up to 3 Years (PGWP)',
      topFields: ['Computer Science', 'Data Analytics', 'Business Management', 'Engineering'],
      costEstimate: '$18,000 - $30,000 CAD / Year'
    },
    'United Kingdom': {
      name: 'United Kingdom',
      flag: '🇬🇧',
      visaSuccess: '96.5%',
      processingTime: '3 - 4 Weeks',
      workPermit: '2 Years Graduate Route',
      topFields: ['Finance & Accounting', 'Public Health', 'Data Science', 'Law'],
      costEstimate: '£15,000 - £26,000 GBP / Year'
    },
    'United States': {
      name: 'United States',
      flag: '🇺🇸',
      visaSuccess: '92.4%',
      processingTime: '2 - 5 Weeks',
      workPermit: '1 - 3 Years OPT (STEM)',
      topFields: ['Artificial Intelligence', 'MBA', 'Biotechnology', 'Mechanical Engineering'],
      costEstimate: '$25,000 - $55,000 USD / Year'
    },
    Germany: {
      name: 'Germany',
      flag: '🇩🇪',
      visaSuccess: '94.8%',
      processingTime: '6 - 12 Weeks',
      workPermit: '18 Months Post-Study',
      topFields: ['Automotive Engineering', 'Renewable Energy', 'Logistics', 'Robotics'],
      costEstimate: '€0 - €3,000 (Tuition Free / Small Fees)'
    },
    Australia: {
      name: 'Australia',
      flag: '🇦🇺',
      visaSuccess: '95.1%',
      processingTime: '4 - 6 Weeks',
      workPermit: '2 - 4 Years Post-Study',
      topFields: ['Information Technology', 'Nursing & Healthcare', 'Hospitality', 'Cybersecurity'],
      costEstimate: '$22,000 - $40,000 AUD / Year'
    },
    Ireland: {
      name: 'Ireland',
      flag: '🇮🇪',
      visaSuccess: '95.8%',
      processingTime: '4 - 6 Weeks',
      workPermit: '2 Years Third Level Scheme',
      topFields: ['Software Development', 'Pharmaceutical Sciences', 'Cloud Computing', 'Finance'],
      costEstimate: '€12,000 - €22,000 EUR / Year'
    },
    France: {
      name: 'France',
      flag: '🇫🇷',
      visaSuccess: '93.6%',
      processingTime: '3 - 5 Weeks',
      workPermit: '1 - 2 Years Post-Study',
      topFields: ['Fashion & Design', 'Luxury Brand Management', 'Aerospace Engineering', 'Culinary Arts'],
      costEstimate: '€3,000 - €15,000 EUR / Year'
    },
    'New Zealand': {
      name: 'New Zealand',
      flag: '🇳🇿',
      visaSuccess: '94.2%',
      processingTime: '5 - 8 Weeks',
      workPermit: 'Up to 3 Years Post-Study',
      topFields: ['Environmental Science', 'Agriculture & Forestry', 'Creative Tech', 'Hospitality'],
      costEstimate: '$20,000 - $35,000 NZD / Year'
    },
    Singapore: {
      name: 'Singapore',
      flag: '🇸🇬',
      visaSuccess: '91.5%',
      processingTime: '2 - 4 Weeks',
      workPermit: '1 - 3 Years (S-Pass / EP)',
      topFields: ['FinTech', 'Logistics & Supply Chain', 'Artificial Intelligence', 'Biomedical'],
      costEstimate: '$18,000 - $38,000 SGD / Year'
    }
  };

  const handleLaunchAI = () => {
    // Custom window event to open EligibilityBot
    window.dispatchEvent(new CustomEvent('open-eligibility-bot'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
      
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-red-650 rounded-xl shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="EduAgent" className="h-10 w-10 object-contain brightness-0 invert" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              EduAgent<span className="bg-gradient-to-r from-red-650 to-red-500 bg-clip-text text-transparent">Portal</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#destinations" className="hover:text-cyan-600 transition-colors">Destinations</a>
            <a href="#pathway-finder" className="hover:text-cyan-600 transition-colors">Eligibility Tool</a>
            <a href="#features" className="hover:text-cyan-600 transition-colors">Key Features</a>
            <a href="#experience" className="hover:text-cyan-600 transition-colors">Platform Tour</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-slate-700 hover:text-red-650 font-semibold transition-colors text-sm px-4 py-2.5 rounded-xl">
              Sign In
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-red-650 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold transition-all text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-red-650/20 hover:scale-[1.02] active:scale-[0.98]">
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* Worldclass Premium Hero Section */}
      <section className="relative bg-slate-950 text-white py-28 md:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 bg-cover bg-center z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-cyan-600/30 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 -right-1/4 w-[400px] h-[400px] bg-red-800/20 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020617_95%)] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Box */}
          <div className="lg:col-span-7 space-y-8 text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-cyan-300">
              <Sparkles className="h-4 w-4 text-red-500 animate-pulse" />
              Next-Gen Multi-Tenant Global Admissions SaaS
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Bridge Your Academics <br />
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-cyan-400 bg-clip-text text-transparent">Across Borders</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed max-w-xl">
              We streamline university admissions & immigration processing with real-time application trackers, secure cloud repositories, and direct matching with international agents.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#pathway-finder" className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-cyan-500/10 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                Evaluate Your Eligibility
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/register" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                Register as Student
              </Link>
            </div>

            {/* Quick Micro-stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <p className="text-3xl font-extrabold text-white">98.2%</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Visa Success</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">10k+</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Students Assisted</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">50+</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Global Agencies</p>
              </div>
            </div>
          </div>

          {/* Right Visual Dashboard Mockup (Stunning 3D look) */}
          <div className="lg:col-span-5 relative w-full flex justify-center z-10">
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/10 to-red-650/10 opacity-30 pointer-events-none"></div>
              
              {/* Fake App header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-slate-400 font-mono tracking-tight bg-slate-950 px-3 py-1 rounded-full border border-slate-800/50">
                  portal.eduagent.io
                </div>
              </div>

              {/* Fake dashboard welcome content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Sarah Jenkins</h4>
                    <p className="text-xs text-slate-400">Application: MSc in Cyber Security</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full animate-pulse">
                    Stage 4: Under Review
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Overall Progress</span>
                    <span className="text-cyan-400 font-bold">68%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-600 to-red-650 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>

                {/* Simulated Stages */}
                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold"><Check className="w-3 h-3" /></div>
                      <span className="text-slate-300">Personal & Academic Details</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Completed</span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold"><Check className="w-3 h-3" /></div>
                      <span className="text-slate-300">English Proficiency Test Report</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">IELTS 7.5</span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-950/90 p-3 rounded-xl border-l-4 border-cyan-500 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-extrabold animate-spin">◌</div>
                      <span className="font-semibold text-slate-200">Visa Document Verification</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider animate-pulse">Agent Action</span>
                  </div>
                </div>

                {/* Simulated Agent Chat Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex gap-3 items-start mt-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    EA
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-300">EduAgent System</p>
                    <p className="text-xs text-slate-400 leading-normal">
                      "I've verified your financial statements, Sarah. Moving your visa dossier to the embassy queue."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Ticker / Dynamic Trust Badges */}
      <section className="bg-white py-6 border-y border-slate-100 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-6 text-sm font-semibold tracking-wider uppercase text-slate-400">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-600" /> GDPR & Privacy Compliant</span>
          <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-600" /> 180+ Universities Connected</span>
          <span className="flex items-center gap-2"><Award className="w-4 h-4 text-cyan-600" /> 98.2% Visa Approval Rate</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-600" /> 48-Hour Agent Response Time</span>
        </div>
      </section>

      {/* Destinations Section - Interactive Country Selector */}
      <section id="destinations" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Top Study Destinations & Visa Success Rates
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-light text-lg">
            Choose your dream destination and view key migration indicators built directly into our secure platform.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {Object.keys(countryDetails).map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                selectedCountry === country
                  ? 'bg-slate-900 text-white shadow-xl scale-[1.03]'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{countryDetails[country].flag}</span>
              {country}
            </button>
          ))}
        </div>

        {/* Selected Country Details Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-500">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{countryDetails[selectedCountry].flag}</span>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900">Study in {selectedCountry}</h3>
                <p className="text-sm font-medium text-slate-500">Global Academic & Work Pathway Overview</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visa Approval</span>
                <p className="text-2xl font-black text-cyan-600">{countryDetails[selectedCountry].visaSuccess}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processing Time</span>
                <p className="text-2xl font-black text-slate-800">{countryDetails[selectedCountry].processingTime}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Post-Study Work</span>
                <p className="text-2xl font-black text-slate-800">{countryDetails[selectedCountry].workPermit}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 text-sm">Top Highly-Sought Fields of Study:</h4>
              <div className="flex flex-wrap gap-2">
                {countryDetails[selectedCountry].topFields.map((field) => (
                  <span key={field} className="bg-cyan-500/10 text-cyan-900 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-cyan-500/20">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Annual Tuition</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">{countryDetails[selectedCountry].costEstimate}</p>
            </div>
            
            <div className="space-y-4 border-t border-slate-800 pt-6 text-sm font-light text-slate-300">
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Submit university application directly through our matching module.</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Upload and verify all target country visa checklist documents.</span>
              </div>
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Dedicated native country counselor assignment to check final files.</span>
              </div>
            </div>

            <Link href="/register" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-600/20 transition-all text-sm mt-2 cursor-pointer text-center">
              Get Started for {selectedCountry}
              <ArrowRight className="h-4 w-4 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pathways / Interactive Steps Generator */}
      <section id="pathway-finder" className="bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-950/40 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-950/40 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wide text-cyan-400">
              <Sparkles className="h-4 w-4 text-red-500" />
              Automated AI Qualification Checklist
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">
              Determine Your Study & Immigration Path
            </h2>
            <p className="text-slate-300 font-light leading-relaxed">
              Use our quick eligibility path selector to structure your academic roadmap. Once submitted, our AI agent will analyze and deliver instant matching scores.
            </p>
            <div className="space-y-4 pt-4 text-sm text-slate-400">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <span>Specify your degree and country choice.</span>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <span>Share your language exam profile details.</span>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <span>Launch the interactive AI Eligibility assistant instantly.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl relative">
            {!showResult ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Eligibility Calculator</h3>
                
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Target Academic Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Bachelor\'s', 'Master\'s', 'PhD', 'Diploma'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDegree(lvl)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            degree === lvl
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Destination Country</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {Object.keys(countryDetails).map((dest) => (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => setDestination(dest)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis px-1 ${
                            destination === dest
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={dest}
                        >
                          {dest === 'United Kingdom' ? 'UK' : dest === 'United States' ? 'USA' : dest === 'New Zealand' ? 'NZ' : dest}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. English Proficiency Status</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {['IELTS', 'TOEFL / Duolingo', 'None / Native'].map((test) => (
                        <button
                          key={test}
                          type="button"
                          onClick={() => setEnglishTest(test)}
                          className={`py-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            englishTest === test
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {test}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResult(true)}
                  className="w-full bg-red-650 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer text-sm"
                >
                  Verify Candidate Eligibility
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-center py-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-white">Target Pathway Generated</h3>
                  <p className="text-slate-400 text-sm font-light">
                    You meet the baseline requirements for a <span className="text-cyan-400 font-bold">{degree}</span> in <span className="text-cyan-400 font-bold">{destination}</span> with {englishTest} status!
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3.5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Eligible for post-study PGWP (Work Permit) pathways.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Average course admission timeline: 4 - 6 weeks.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Requires notarized degree transcript submission.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={handleLaunchAI}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Discuss with AI Assistant
                  </button>
                  <button
                    onClick={() => setShowResult(false)}
                    className="border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-6 py-3.5 rounded-xl text-xs cursor-pointer"
                  >
                    Adjust Details
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Visual Platform Tour / Live App Tracking Showcase */}
      <section id="experience" className="py-24 bg-white px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              A Transparent, Stage-by-Stage Application Experience
            </h2>
            <p className="text-slate-500 font-light text-lg max-w-2xl mx-auto">
              Follow every aspect of your visa and university files. No black holes, no uncertainty.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Interactive Timeline graphics on the left */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-6">
                <div className="relative pl-10 border-l border-slate-200 space-y-10">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-14 w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center border-2 border-cyan-500 font-bold text-xs">
                      1
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base">Select Your Education Agency</h4>
                      <p className="text-slate-500 text-sm font-light">
                        Create your account and match instantly with an authorized agency licensed to process admissions for your target country.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -left-14 w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center border-2 border-cyan-500 font-bold text-xs">
                      2
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base">Interactive Multi-Step Application Form</h4>
                      <p className="text-slate-500 text-sm font-light">
                        Fill out personal details, academic scores, and upload files directly inside your secure student dashboard.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className="absolute -left-14 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center border-2 border-cyan-500 font-bold text-xs animate-bounce">
                      3
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-cyan-700 text-base">Collaborative Agent Review & Live Chat</h4>
                      <p className="text-slate-600 text-sm font-light">
                        Your assigned professional counselor reviews and validates each file. Chat in real-time, get prompt corrections, and track updates.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Simulated Desktop Student Document Dashboard on the right */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">Required Document Dossier</span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">3 of 4 Uploaded</span>
              </div>

              <div className="space-y-3.5">
                
                {/* Item 1 */}
                <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><Check className="w-4 h-4" /></div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">International Passport Data Page</p>
                      <p className="text-[10px] text-slate-400">passport_dossier.pdf (2.4 MB)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><Check className="w-4 h-4" /></div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">University Transcript & Certs</p>
                      <p className="text-[10px] text-slate-400">bachelors_degree_transcript.pdf (5.1 MB)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><Check className="w-4 h-4" /></div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">IELTS Exam Score Sheet</p>
                      <p className="text-[10px] text-slate-400">ielts_report_signed.pdf (1.1 MB)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                {/* Item 4 - Requires re-upload */}
                <div className="flex items-center justify-between bg-red-50 border border-red-100 p-3 rounded-xl shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-650 p-2 rounded-lg"><ArrowRight className="w-4 h-4 rotate-90" /></div>
                    <div>
                      <p className="font-semibold text-red-950 text-xs">Financial Statement (3 Months)</p>
                      <p className="text-[10px] text-red-500">Statement must be signed and stamped</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-650 bg-red-100 px-2 py-0.5 rounded">Action Required</span>
                </div>

              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-600" /> Counselor Feedback:</p>
                <p className="font-light text-slate-700">"Your bank statement upload is missing the official bank seal. Please re-upload so we can clear this verification hurdle."</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Split Panels for Students vs Agencies */}
      <section id="features" className="py-24 bg-slate-50 border-b border-slate-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for Global Candidates & Ambitious Agencies
            </h2>
            <p className="text-slate-500 font-light text-lg max-w-2xl mx-auto">
              Our multi-tenant architecture isolated database guarantees complete privacy and operational excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Students Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-lg relative overflow-hidden group hover:border-cyan-400 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-600/10 transition-colors"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">For Students</h3>
                </div>
                
                <p className="text-slate-500 font-light leading-relaxed">
                  Take total charge of your university admission and visa portfolio. Say goodbye to offline agency black boxes.
                </p>

                <ul className="space-y-4 pt-4 border-t border-slate-100">
                  {[
                    { title: 'Secure Document Repository', desc: 'Authenticated file manager ensures private credentials stream securely.' },
                    { title: 'Dedicated Counselor Assignment', desc: 'Get direct matching with visa experts specializing in your destination.' },
                    { title: 'Stage Timeline Tracker', desc: '12 clear structural stages showing exactly where your file rests.' },
                    { title: 'Instant Interactive Chat', desc: 'In-app discussion portal with direct file attachment capacities.' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-xs shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                        <p className="text-slate-500 text-xs font-light">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Agencies Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden group hover:border-red-650/40 border border-slate-850 transition-all duration-300">
              <div className="absolute bottom-0 right-0 w-36 h-36 bg-red-800/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-800/20 transition-colors"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-red-950/40 text-red-500 rounded-2xl border border-red-900/50">
                    <Users className="h-6 w-6" />
                  </span>
                  <h3 className="text-2xl font-bold text-white">For Agencies</h3>
                </div>
                
                <p className="text-slate-300 font-light leading-relaxed">
                  Accelerate counselor conversions and manage document verification queues inside a secure SaaS workspace.
                </p>

                <ul className="space-y-4 pt-4 border-t border-slate-800">
                  {[
                    { title: 'Roster Management Dashboard', desc: 'Filter, check, and edit applications and student records seamlessly.' },
                    { title: 'Agent Assignment Routing', desc: 'Manually allocate or allow self-claiming structures for consultants.' },
                    { title: 'Checklist Verification Engine', desc: 'Approve, reject, or request adjustments on documents in one click.' },
                    { title: 'Data Isolation Architecture', desc: 'Complete database layer separation securing tenant boundaries.' }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-950/60 text-red-400 flex items-center justify-center text-xs shrink-0 mt-0.5 border border-red-900/30"><Check className="w-3.5 h-3.5" /></div>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">{item.title}</h4>
                        <p className="text-slate-400 text-xs font-light">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Trust, Enterprise Security, Storage Compliance Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-[40px] p-8 lg:p-16 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-5" style={{ backgroundImage: "url('/login-bg.png')" }} />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Enterprise Standards</h3>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Secure Infrastructure & Strict Regulatory Compliance
              </h2>
              <p className="text-slate-400 font-light text-base">
                Your credentials are encrypted and stored in fully-isolated databases using top-tier cloud architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left pt-6">
              
              {/* Feature 1 */}
              <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">Tenant Isolation</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Queries are securely scoped to confirm users can never access files from another agency.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">Private Stream Storage</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  All documents are streamed securely, keeping private credentials away from public asset URLs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">Full Audit Trails</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Every status correction, document verification, and counselor assignment is fully logged.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-tr from-cyan-900 to-slate-950 text-white py-24 text-center px-4 relative overflow-hidden border-t border-cyan-800/30">
        <div className="absolute inset-0 bg-cover bg-center z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ready to Begin Your International Academic Route?
          </h2>
          <p className="text-lg text-slate-300 font-light max-w-xl mx-auto leading-relaxed">
            Create an account or connect with your designated counselor today. The process takes less than two minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="/register" className="bg-gradient-to-r from-red-650 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-red-650/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-[1.02] text-center">
              Start Your Application
              <ArrowRight className="w-4 h-4 inline" />
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center text-sm text-center">
              Sign In to Your Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-slate-900">
            <div className="flex items-center space-x-3 text-white">
              <div className="p-2 bg-gradient-to-tr from-cyan-600 to-red-650 rounded-lg">
                <img src="/logo.png" alt="EduAgent" className="h-6 w-6 object-contain brightness-0 invert" />
              </div>
              <span className="font-bold text-lg tracking-tight">EduAgent Portal</span>
            </div>
            
            <p className="text-sm font-light text-slate-500">
              &copy; {new Date().getFullYear()} EduAgent SaaS. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-light text-slate-500">
            <div className="space-y-3">
              <h5 className="font-bold text-slate-400 uppercase tracking-wider">Destinations</h5>
              <ul className="space-y-2">
                <li>Study in Canada</li>
                <li>Study in the United Kingdom</li>
                <li>Study in the United States</li>
                <li>Study in Germany</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-slate-400 uppercase tracking-wider">Platform</h5>
              <ul className="space-y-2">
                <li>Student Application Workspace</li>
                <li>Agency Dashboard</li>
                <li>AI Eligibility Advisor</li>
                <li>Secure File Stream</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-slate-400 uppercase tracking-wider">Security</h5>
              <ul className="space-y-2">
                <li>Tenant Isolation Boundaries</li>
                <li>Encryption Compliance</li>
                <li>Audit Logs API</li>
                <li>Cloud Provider Info</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-slate-400 uppercase tracking-wider">Support</h5>
              <ul className="space-y-2">
                <li>Counselor Connection FAQ</li>
                <li>Technical Platform Roster</li>
                <li>Submit Feedback Ticket</li>
                <li>Developer API Keys</li>
              </ul>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating AI eligibility bot */}
      <EligibilityBot />
    </div>
  );
}
