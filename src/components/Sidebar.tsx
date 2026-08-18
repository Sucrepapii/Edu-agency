'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, LayoutDashboard, Users, UserCheck, FileText, FolderOpen,
  MessageSquare, Bell, User, Settings, LogOut, Menu, X, ShieldAlert
} from 'lucide-react';
import { UserSession } from '@/hooks/useUser';

interface SidebarProps {
  user: UserSession;
  logout: () => void;
}

export default function Sidebar({ user, logout }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications in sidebar:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  // Define sidebar links based on user role
  const getSidebarLinks = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Overview', href: '/dashboard/super-admin', icon: LayoutDashboard },
          { label: 'Finances', href: '/dashboard/super-admin/finances', icon: FileText },
          { label: 'Agencies', href: '/dashboard/super-admin/agencies', icon: ShieldAlert },
          { label: 'Announcements', href: '/dashboard/super-admin/announcements', icon: MessageSquare },
          { label: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
        ];
      case 'AGENCY_ADMIN':
        return [
          { label: 'Dashboard', href: '/dashboard/agency-admin', icon: LayoutDashboard },
          { label: 'New Students', href: '/dashboard/agency-admin/queue', icon: UserCheck },
          { label: 'Agents Management', href: '/dashboard/agency-admin/agents', icon: Users },
          { label: 'Settings', href: '/dashboard/agency-admin/settings', icon: Settings },
        ];
      case 'AGENT':
        const agentLinks = [
          { label: 'Dashboard', href: '/dashboard/agent', icon: LayoutDashboard },
          { label: 'My Students', href: '/dashboard/agent/students', icon: Users },
          { label: 'Messages', href: '/dashboard/agent/messages', icon: MessageSquare },
          { label: 'Profile Settings', href: '/dashboard/agent/profile', icon: Settings },
        ];
        // Only show Available Students link if agency has claim enabled
        if (user.agency?.assignmentMode === 'ADMIN_AND_CLAIM') {
          agentLinks.splice(2, 0, { label: 'Available Students', href: '/dashboard/agent/claim', icon: UserCheck });
        }
        return agentLinks;
      case 'STUDENT':
        return [
          { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
          { label: 'My Application', href: '/dashboard/student/application', icon: FileText },
          { label: 'My Documents', href: '/dashboard/student/documents', icon: FolderOpen },
          { label: 'My Agent', href: '/dashboard/student/agent', icon: User },
          { label: 'Messages', href: '/dashboard/student/messages', icon: MessageSquare },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks();

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh the page to reload user session
        window.location.reload();
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Connection error.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      {user?.forcePasswordChange && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-red-400"></div>
            <div className="text-center mb-6">
              <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Security Required</h2>
              <p className="text-slate-400 text-sm font-light mt-2">You must change your auto-generated temporary password before accessing the dashboard.</p>
            </div>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {passwordError && (
                <div className="text-red-400 text-xs text-center font-medium bg-red-950/50 py-2 rounded border border-red-900/50">
                  {passwordError}
                </div>
              )}
              <button 
                type="submit" 
                disabled={isChangingPassword}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all mt-4 disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Burger Menu Button */}
      <div className="lg:hidden bg-slate-900 text-white h-16 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="EduAgent" className="h-10 w-10 object-contain" />
          <span className="font-bold text-md tracking-tight">EduAgent Portal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setIsOpen(true);
              setShowNotifications(!showNotifications);
            }} 
            className="relative p-2 text-slate-400 hover:text-white cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-400 hover:text-white cursor-pointer">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="relative p-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="EduAgent" className="h-9 w-9 object-contain" />
              <span className="font-extrabold text-base tracking-tight">EduAgent<span className="text-red-500">Portal</span></span>
            </div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {user.agency && (
            <p className="text-xs text-slate-400 font-light mt-1 truncate">{user.agency.name}</p>
          )}

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute left-4 right-4 top-[72px] bg-slate-900 border border-slate-850 rounded-xl shadow-2xl z-50 overflow-hidden text-left flex flex-col max-h-[300px]">
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                <span className="text-xs font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto divide-y divide-slate-800/50 flex-1">
                {unreadCount === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-light">
                    No new notifications
                  </div>
                ) : (
                  notifications.filter(n => !n.read).map((n) => (
                    <div 
                      key={n.id} 
                      className="p-3 text-xs transition-colors hover:bg-slate-800/40 bg-slate-800/20 font-medium border-l-2 border-red-500"
                    >
                      <p className="text-white font-semibold">{n.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-light">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all border-l-4 group ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/10 border-red-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Card & Logout */}
        <div className="p-4 border-t border-slate-800/60 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-red-500 font-bold border border-slate-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 font-light truncate uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all cursor-pointer font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
