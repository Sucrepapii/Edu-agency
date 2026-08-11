'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Users, GraduationCap, FileText, Mail, Globe, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function AgencyDeepDivePage() {
  const { user, loading, logout } = useUser();
  const { id } = useParams();
  const router = useRouter();

  const [agency, setAgency] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && id) loadAgency();
  }, [user, id]);

  const loadAgency = async () => {
    try {
      setLoadingData(true);
      const res = await fetch(`/api/super-admin/agencies/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAgency(data);
      } else {
        router.push('/dashboard/super-admin/agencies');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />
      
      <main className="flex-1 p-6 lg:p-10 w-full space-y-8 overflow-y-auto">
        
        {loadingData ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
          </div>
        ) : agency ? (
          <>
            <div>
              <Link href="/dashboard/super-admin/agencies" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Agencies
              </Link>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    {agency.name}
                  </h1>
                  <p className="text-sm text-slate-500 font-light mt-1 flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {agency.country || 'No country set'}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {agency.email || 'No email set'}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {agency.phone || 'No phone set'}</span>
                    {agency.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {agency.website}</span>}
                  </p>
                </div>
                <div>
                  {agency.status === 'ACTIVE' ? (
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full text-xs border border-emerald-100">Active</span>
                  ) : (
                    <span className="bg-rose-50 text-rose-700 font-semibold px-3 py-1 rounded-full text-xs border border-rose-100">Suspended</span>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{agency._count.users}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Agents</p>
                  <p className="text-2xl font-bold text-slate-900">{agency._count.agents}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Students</p>
                  <p className="text-2xl font-bold text-slate-900">{agency._count.students}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Applications</p>
                  <p className="text-2xl font-bold text-slate-900">{agency._count.applications}</p>
                </div>
              </div>
            </div>

            {/* Recent Users List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Recent Agency Users</h3>
              </div>
              {agency.users && agency.users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-lg">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agency.users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                              {u.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{u.email}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">No users found for this agency.</div>
              )}
            </div>

          </>
        ) : null}

      </main>
    </div>
  );
}
