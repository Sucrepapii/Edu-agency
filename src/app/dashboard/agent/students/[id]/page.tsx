'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Check, X, FileCheck, RefreshCw, Send, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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

export default function AgentStudentDetailsPage() {
  const { user, loading, logout } = useUser();
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState<any | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Status updates & Document review states
  const [selectedStage, setSelectedStage] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({}); // docId -> comment
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [docToReview, setDocToReview] = useState<{ id: string, status: string, name: string } | null>(null);



  useEffect(() => {
    if (id) {
      loadStudentDetails();
    }
  }, [id]);

  const loadStudentDetails = async () => {
    try {
      setLoadingStudent(true);
      setErrorMsg(null);
      const res = await fetch('/api/agent/students');
      if (res.ok) {
        const data = await res.json();
        const st = (data.students || []).find((s: any) => s.id === id);
        if (st) {
          setStudent(st);
          setSelectedStage(st.application?.status || '');
        } else {
          setErrorMsg('Access Denied or Student profile not found. Agents can only view their own assigned students.');
        }
      }
    } catch (err) {
      console.error('Failed to load student details:', err);
      setErrorMsg('Failed to load student details.');
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleUpdateStage = async () => {
    try {
      setUpdatingStage(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await fetch('/api/agent/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, stage: selectedStage }),
      });

      if (res.ok) {
        setSuccessMsg('Application stage updated successfully!');
        loadStudentDetails(); // Reload data
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update stage.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to stage update service.');
    } finally {
      setUpdatingStage(false);
    }
  };

  const confirmReviewDoc = async () => {
    if (!docToReview) return;
    try {
      setReviewingDocId(docToReview.id);
      setSuccessMsg(null);
      setErrorMsg(null);

      const comment = commentText[docToReview.id] || '';

      const res = await fetch(`/api/documents/${docToReview.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: docToReview.status, comment }),
      });

      if (res.ok) {
        setSuccessMsg(`Document reviewed successfully as ${docToReview.status.toLowerCase().replace('_', ' ')}.`);
        setCommentText(prev => ({ ...prev, [docToReview.id]: '' })); // Clear comment
        setDocToReview(null);
        loadStudentDetails(); // Reload data
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to review document.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to review service.');
    } finally {
      setReviewingDocId(null);
    }
  };

  const handleReviewDoc = async (docId: string, status: string, docName: string) => {
    if (status === 'APPROVED') {
      // Direct action for approve (no double opt-in needed)
      setDocToReview({ id: docId, status, name: docName });
      // We still need to call it directly. Actually, better to just set the state and then manually run the same logic or just use the confirmReviewDoc function but call it immediately.
      // Let's just set the state to trigger the modal for all, or wait, I want approve to be instant.
      // I'll just write a quick inline fetch for approve to keep it instant, or I can just call the double opt-in for all of them so it's consistent. 
      // Let's use the double opt in for all of them for consistency.
      setDocToReview({ id: docId, status, name: docName });
    } else {
      setDocToReview({ id: docId, status, name: docName });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 w-full space-y-8 overflow-y-auto">
        
        {/* Back Link & Header */}
        <div className="space-y-4">
          <Link href="/dashboard/agent/students" className="text-xs text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1">
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to roster
          </Link>

          {student && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{student.user.name}</h1>
                <p className="text-slate-500 text-sm font-light mt-1">{student.user.email} &bull; Home Country: {student.application?.prefCountry}</p>
              </div>
              <Link
                href={`/dashboard/agent/messages?studentId=${student.id}`}
                className="bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm"
              >
                Chat with Student
              </Link>
            </div>
          )}
        </div>

        {/* Messaging alerts */}
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

        {loadingStudent ? (
          <div className="text-center py-12 text-slate-400">Loading student dossier...</div>
        ) : !student ? (
          <div className="text-center py-12 text-slate-400">Dossier unavailable.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Stage Updater & Application Data */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Application Details Checklist Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Application Dossier</h3>
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-light text-slate-600">
                    <div><span className="font-medium text-slate-500">Gender:</span> {student.application?.gender || '—'}</div>
                    <div><span className="font-medium text-slate-500">Date of Birth:</span> {student.application?.dob || '—'}</div>
                    <div><span className="font-medium text-slate-500">Nationality:</span> {student.application?.nationality || '—'}</div>
                    <div><span className="font-medium text-slate-500">Phone:</span> {student.application?.phone || '—'}</div>
                  </div>
                </div>

                {/* Education */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Record</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-light text-slate-600">
                    <div><span className="font-medium text-slate-500">Qualification:</span> {student.application?.highestQualification || '—'}</div>
                    <div><span className="font-medium text-slate-500">Institution:</span> {student.application?.institution || '—'}</div>
                    <div><span className="font-medium text-slate-500">Program:</span> {student.application?.course || '—'}</div>
                    <div><span className="font-medium text-slate-500">Graduation Year:</span> {student.application?.graduationYear || '—'}</div>
                    <div><span className="font-medium text-slate-500">Grade/GPA:</span> {student.application?.gpa || '—'}</div>
                  </div>
                </div>

                {/* Study Preferences */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Study Preferences</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-light text-slate-600">
                    <div><span className="font-medium text-slate-500">Country:</span> {student.application?.prefCountry || '—'}</div>
                    <div><span className="font-medium text-slate-500">School:</span> {student.application?.prefSchool || '—'}</div>
                    <div><span className="font-medium text-slate-500">Course:</span> {student.application?.prefCourse || '—'}</div>
                    <div><span className="font-medium text-slate-500">Intake:</span> {student.application?.prefIntake || '—'}</div>
                    <div><span className="font-medium text-slate-500">Budget:</span> {student.application?.budget || '—'}</div>
                  </div>
                </div>

                {/* Additional Info */}
                {student.application?.additionalInfo && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Additional Comments</h4>
                    <p className="text-slate-600 text-sm font-light leading-relaxed">{student.application.additionalInfo}</p>
                  </div>
                )}
              </div>

              {/* Document Review List (Section 16) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Uploaded Document Review</h3>

                <div className="space-y-6">
                  {student.documents?.length === 0 ? (
                    <p className="text-slate-400 text-sm font-light">No documents required for this student.</p>
                  ) : (
                    student.documents.map((doc: any) => (
                      <div key={doc.id} className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-55/50">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start space-x-3">
                            <FileText className="h-6 w-6 text-cyan-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800">{doc.documentType}</p>
                              <p className="text-xs font-light text-slate-400">
                                Status:{' '}
                                <span className={`font-semibold ${
                                  doc.status === 'APPROVED' ? 'text-emerald-600' : doc.status === 'RESUBMISSION_REQUIRED' ? 'text-amber-600' : 'text-slate-500'
                                }`}>
                                  {doc.status.toLowerCase().replace(/_/g, ' ')}
                                </span>
                              </p>
                            </div>
                          </div>

                          {doc.fileUrl && (
                            <a
                              href={`/api/documents/${doc.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              Download File
                            </a>
                          )}
                        </div>

                        {/* Action buttons (only if file uploaded) */}
                        {doc.fileUrl && (
                          <div className="border-t border-slate-100 pt-4 space-y-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReviewDoc(doc.id, 'APPROVED', doc.type)}
                                disabled={reviewingDocId !== null}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewDoc(doc.id, 'RESUBMISSION_REQUIRED', doc.type)}
                                disabled={reviewingDocId !== null}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Request Resubmission
                              </button>
                              <button
                                onClick={() => handleReviewDoc(doc.id, 'REJECTED', doc.type)}
                                disabled={reviewingDocId !== null}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </div>

                            {/* Resubmission feedback comments */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Review feedback comment</label>
                              <input
                                type="text"
                                placeholder="e.g. Please upload a clearer scan of the passport information page."
                                value={commentText[doc.id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [doc.id]: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-3 py-1.5 outline-none transition-all text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Stage Updater Sidebar Card (Section 17) */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
                <h3 className="font-bold text-slate-800">Application Stage</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Update the application stage to automatically recalculate student progress indicators.
                </p>

                <div className="space-y-4">
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-3 py-2.5 outline-none text-xs appearance-none cursor-pointer"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleUpdateStage}
                    disabled={updatingStage || selectedStage === student.application?.status}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 rounded-lg text-xs shadow-sm hover:shadow-cyan-600/10 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {updatingStage ? 'Updating...' : 'Save Stage Update'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Document Review Confirmation Modal */}
        {docToReview && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                Confirm Document Review
              </h3>
              <p className="text-slate-600 text-sm font-light">
                Are you sure you want to mark <strong>{docToReview.name.replace('_', ' ')}</strong> as <span className="font-semibold">{docToReview.status.replace('_', ' ').toLowerCase()}</span>?
              </p>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDocToReview(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReviewDoc}
                  className={`flex-1 font-semibold py-2.5 rounded-xl shadow-md transition-colors cursor-pointer ${
                    docToReview.status === 'APPROVED' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : docToReview.status === 'REJECTED'
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
