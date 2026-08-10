'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { user } = useUser(false);
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Poll for notifications
  useEffect(() => {
    if (!user) {
      knownNotificationIds.current = new Set();
      isFirstFetch.current = true;
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const notifications = data.notifications || [];
          
          if (isFirstFetch.current) {
            // First fetch after login: register all existing notifications as known
            const ids = new Set<string>(notifications.map((n: any) => n.id));
            knownNotificationIds.current = ids;
            isFirstFetch.current = false;
          } else {
            // Subsequent fetches: find new, unread notifications
            notifications.forEach((n: any) => {
              if (!knownNotificationIds.current.has(n.id)) {
                // If it's unread, show a toast!
                if (!n.read) {
                  showToast(
                    n.title || 'Notification',
                    n.message || '',
                    n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : 'info'
                  );
                }
                // Add to known
                knownNotificationIds.current.add(n.id);
              }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching notifications for toast:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let Icon = Info;
          let bgColor = 'bg-white border-slate-200 text-slate-800';
          let iconColor = 'text-slate-500';
          let progressColor = 'bg-slate-400';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            bgColor = 'bg-white border-cyan-200 text-slate-800';
            iconColor = 'text-cyan-600';
            progressColor = 'bg-cyan-600';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            bgColor = 'bg-white border-red-200 text-slate-800';
            iconColor = 'text-red-600';
            progressColor = 'bg-red-600';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            bgColor = 'bg-white border-amber-200 text-slate-800';
            iconColor = 'text-amber-500';
            progressColor = 'bg-amber-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border rounded-xl shadow-lg p-4 flex gap-3 items-start relative overflow-hidden animate-slide-in ${bgColor}`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-light">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Bottom progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                <div className={`h-full ${progressColor} animate-toast-progress`} />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
