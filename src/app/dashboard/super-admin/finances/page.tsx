'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import { Banknote, TrendingUp, Clock, FileText } from 'lucide-react';

export default function FinancesPage() {
  const { user, loading, logout } = useUser();
  const [finances, setFinances] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) loadFinances();
  }, [user]);

  const [error, setError] = useState<string | null>(null);

  const loadFinances = async () => {
    try {
      setLoadingData(true);
      setError(null);
      const res = await fetch('/api/super-admin/finances');
      const data = await res.json();
      if (res.ok) {
        setFinances(data);
      } else {
        setError(data.error || 'Failed to fetch finances');
        console.error('API Error:', data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error');
    } finally {
      setLoadingData(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar user={user} logout={logout} />
      
      <main className="flex-1 p-6 lg:p-10 w-full space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-cyan-600" />
            Global Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-light mt-1">
            Overview of all invoices and payments across every agency.
          </p>
        </div>

        {loadingData ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-100 mt-4">
            <h3 className="font-bold text-lg mb-2">Error Loading Finances</h3>
            <p className="font-mono text-sm">{error}</p>
          </div>
        ) : finances ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(finances.metrics.totalRevenue)}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Pending Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(finances.metrics.pendingRevenue)}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><FileText className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Paid Invoices</p>
                  <p className="text-2xl font-bold text-slate-900">{finances.metrics.paidInvoices}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><FileText className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Pending Invoices</p>
                  <p className="text-2xl font-bold text-slate-900">{finances.metrics.pendingInvoices}</p>
                </div>
              </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Recent Global Invoices</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Last 50</span>
              </div>
              
              {finances.recentInvoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-lg">Invoice ID</th>
                        <th className="px-6 py-4">Agency</th>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {finances.recentInvoices.map((invoice: any) => (
                        <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{invoice.id.split('-')[0]}...</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{invoice.agency?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-slate-600">{invoice.student?.user?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(invoice.amount)}</td>
                          <td className="px-6 py-4">
                            {invoice.status === 'PAID' ? (
                              <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-emerald-100">Paid</span>
                            ) : invoice.status === 'PENDING' ? (
                              <span className="bg-amber-50 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-amber-100">Pending</span>
                            ) : (
                              <span className="bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-rose-100">Cancelled</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Banknote className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No invoices found on the platform yet.</p>
                </div>
              )}
            </div>

          </>
        ) : null}

      </main>
    </div>
  );
}

