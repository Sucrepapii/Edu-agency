'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'SUPER_ADMIN') {
        router.replace('/dashboard/super-admin');
      } else if (user.role === 'AGENCY_ADMIN') {
        router.replace('/dashboard/agency-admin');
      } else if (user.role === 'AGENT') {
        router.replace('/dashboard/agent');
      } else if (user.role === 'STUDENT') {
        router.replace('/dashboard/student');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen bg-slate-50 items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
    </div>
  );
}
