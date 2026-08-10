'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Send, Search, MessageSquare, ChevronRight, GraduationCap, ArrowLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface StudentListRow {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  sender: {
    name: string;
    role: string;
  };
}

function AgentMessagesContent() {
  const { user, loading, logout } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [students, setStudents] = useState<StudentListRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Load student list on mount
  useEffect(() => {
    if (user?.agentProfile?.id) {
      loadStudents();
    }
  }, [user]);

  // Handle URL query param `studentId` for pre-selecting a student
  useEffect(() => {
    const studentIdParam = searchParams.get('studentId');
    if (studentIdParam) {
      setSelectedStudentId(studentIdParam);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id); // Pre-select first student
    }
  }, [searchParams, students]);

  // Load chat messages when selected student changes
  useEffect(() => {
    if (selectedStudentId) {
      loadMessages();
      // Setup polling
      const interval = setInterval(loadMessages, 4000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedStudentId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadStudents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        const myProfile = data.agents.find((a: any) => a.id === user?.agentProfile?.id);
        if (myProfile) {
          setStudents(myProfile.students || []);
        }
      }
    } catch (err) {
      console.error('Failed to load assigned students:', err);
    }
  };

  const loadMessages = async () => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch(`/api/messages?studentId=${selectedStudentId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedStudentId) return;

    try {
      setSending(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: typedMessage, targetStudentId: selectedStudentId }),
      });

      if (res.ok) {
        setTypedMessage('');
        loadMessages(); // Refresh chat
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const activeStudent = students.find((s) => s.id === selectedStudentId);

  // Search filter
  const filteredStudents = students.filter((s) =>
    s.user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} logout={logout} />

      {/* Main Content (Split screen) */}
      <main className="flex-1 flex h-full overflow-hidden bg-slate-100">
        
        {/* Left Panel: Students list */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
          
          {/* List Search */}
          <div className="p-4 border-b border-slate-200 shrink-0 space-y-3">
            <Link href="/dashboard/agent" className="text-[10px] text-slate-500 hover:text-cyan-600 font-semibold inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Student Chats</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-lg pl-9 pr-4 py-2 outline-none text-xs"
              />
            </div>
          </div>

          {/* List Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-light">No students assigned.</div>
            ) : (
              filteredStudents.map((st) => {
                const isActive = st.id === selectedStudentId;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      router.replace(`/dashboard/agent/messages?studentId=${st.id}`);
                    }}
                    className={`w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive ? 'bg-cyan-50/60 border-l-4 border-cyan-600' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-cyan-700' : 'text-slate-800'}`}>
                        {st.user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{st.user.email}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat interface */}
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
          {activeStudent ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-slate-200 h-16 shrink-0 px-6 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-cyan-600 font-bold border border-slate-200">
                    {activeStudent.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">{activeStudent.user.name}</h2>
                    <p className="text-[10px] text-slate-400 font-light truncate">{activeStudent.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/60">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 font-light text-xs">
                    No messages exchanged. Write a message below to start guiding the student.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm text-sm ${
                          isMe 
                            ? 'bg-cyan-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}>
                          {!isMe && (
                            <p className="text-[10px] font-bold text-cyan-600 mb-1">
                              {msg.sender.name}
                            </p>
                          )}
                          <p className="leading-relaxed font-light">{msg.message}</p>
                          <p className={`text-[9px] text-right mt-2 ${isMe ? 'text-cyan-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="bg-white border-t border-slate-200 p-4 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    placeholder={`Message ${activeStudent.user.name}...`}
                    disabled={sending}
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 rounded-lg px-4 py-3 outline-none transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !typedMessage.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-3 rounded-lg shadow-sm hover:shadow-cyan-600/10 cursor-pointer transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <MessageSquare className="h-16 w-16 text-slate-300" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">No Conversation Selected</h3>
                <p className="text-slate-400 text-sm font-light max-w-xs mx-auto mt-1">
                  Select a student from the sidebar list to review chat logs and send updates.
                </p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function AgentMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
      </div>
    }>
      <AgentMessagesContent />
    </Suspense>
  );
}
