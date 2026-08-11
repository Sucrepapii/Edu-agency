'use client';

import { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';

export default function GlobalAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch if we haven't dismissed them all locally
    fetch('/api/super-admin/announcements')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter to only active ones
          const activeAnnouncements = data.filter(a => a.isActive);
          setAnnouncements(activeAnnouncements);
        }
      })
      .catch(err => console.error('Failed to load announcements', err));
  }, []);

  const dismiss = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  if (announcements.length === 0) return null;

  return (
    <div className="flex flex-col w-full z-50">
      {announcements.map(ann => (
        <div key={ann.id} className="bg-cyan-600 text-white px-4 py-3 sm:px-6 lg:px-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-sm leading-6 flex items-center gap-2">
              <Megaphone className="h-4 w-4 shrink-0" />
              <strong className="font-semibold">{ann.title}</strong>
              <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg>
              <span>{ann.message}</span>
            </p>
            <button 
              type="button" 
              onClick={() => dismiss(ann.id)}
              className="-m-3 p-3 focus-visible:outline-offset-[-4px] hover:bg-cyan-700 rounded-md transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
