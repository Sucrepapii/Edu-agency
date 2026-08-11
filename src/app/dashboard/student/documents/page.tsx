'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { FileUp, Eye, CheckCircle, AlertTriangle, AlertCircle, FileText, Info, ArrowLeft } from 'lucide-react';

interface DocumentRecord {
  id: string;
  documentType: string;
  status: 'REQUIRED' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUIRED';
  fileUrl?: string;
  comment?: string;
  uploadedAt?: string;
}

export default function StudentDocumentsPage() {
  const { user, loading, logout, mutate } = useUser();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load documents on mount / user session load
  useEffect(() => {
    if (user?.studentProfile?.id) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/student/application');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.application?.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Document "${docType}" uploaded successfully!`);
        fetchDocuments(); // Refresh documents table
        mutate(); // Refresh user session details
      } else {
        setErrorMsg(data.error || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to upload service.');
    } finally {
      setUploading(false);
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

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Under Review</span>;
      case 'UPLOADED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Uploaded</span>;
      case 'RESUBMISSION_REQUIRED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Resubmission Required</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Rejected</span>;
      case 'REQUIRED':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Required</span>;
    }
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-slate-500 text-sm font-light mt-1">Upload required certificates, passports, and transcripts for admission review.</p>
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

        {/* Upload widget / Drag & Drop instructions */}
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <FileUp className="h-10 w-10 text-cyan-600 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800">Fast Upload Tool</h3>
            <p className="text-slate-400 text-xs font-light max-w-md mx-auto mt-1">
              Select one of the required documents below and choose a file to upload. Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX. Max file size: 10MB.
            </p>
          </div>
        </div>

        {/* Documents Table List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Document Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-light">
                      No required documents configured yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">{doc.documentType}</p>
                            {doc.comment && (
                              <div className="flex items-start gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 p-1.5 rounded-md mt-1.5 max-w-md font-light">
                                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>{doc.comment}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(doc.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-light text-xs">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-3">
                          {doc.fileUrl && (
                            <a
                              href={`/api/documents/${doc.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-600 hover:text-cyan-500 font-semibold inline-flex items-center gap-1 transition-all"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </a>
                          )}
                          
                          {doc.status !== 'APPROVED' && (
                            <label className={`bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer inline-flex items-center gap-1 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                              <FileUp className="h-3.5 w-3.5" />
                              {doc.fileUrl ? 'Replace' : 'Upload'}
                              <input
                                type="file"
                                disabled={uploading}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, doc.documentType)}
                              />
                            </label>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

