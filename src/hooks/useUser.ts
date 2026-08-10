'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'AGENCY_ADMIN' | 'AGENT' | 'STUDENT';
  agencyId: string | null;
  agency?: {
    id: string;
    name: string;
    logo?: string;
    description?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    country?: string;
    assignmentMode: 'ADMIN_ONLY' | 'ADMIN_AND_CLAIM';
    status: string;
  };
  agentProfile?: {
    id: string;
    position?: string;
    specialization?: string;
    profilePhoto?: string;
    bio?: string;
  };
  studentProfile?: {
    id: string;
    assignmentStatus: 'UNASSIGNED' | 'ASSIGNED';
    assignedAgentId?: string;
    assignedAgent?: {
      id: string;
      user: {
        name: string;
        email: string;
      };
      position?: string;
      profilePhoto?: string;
      specialization?: string;
      bio?: string;
    };
    application?: {
      id: string;
      status: string;
      progressPercentage: number;
      fullName?: string;
      email?: string;
      phone?: string;
      prefCountry?: string;
      prefCourse?: string;
      prefIntake?: string;
      budget?: string;
      dob?: string;
      gender?: string;
      nationality?: string;
      address?: string;
      highestQualification?: string;
      institution?: string;
      course?: string;
      prefSchool?: string;
      graduationYear?: number;
      gpa?: string;
      additionalInfo?: string;
    };
  };
}

export function useUser(redirectToLogin = true) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        if (redirectToLogin) {
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('Error fetching session user:', err);
      setError('Connection error');
      setUser(null);
      if (redirectToLogin) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router, redirectToLogin]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return { user, loading, error, mutate: fetchUser, logout };
}
