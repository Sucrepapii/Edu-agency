'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Send, FileCheck, ArrowUpRight, MessageSquare, ArrowLeft } from 'lucide-react';
import { getPusherClient } from '@/lib/pusher';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  attachmentUrl?: string;
  createdAt: string;
  sender: {
    name: string;
    role: string;
  };
}

export default function StudentMessagesPage() {
  const { user, loading, logout } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.studentProfile?.id) {
      loadMessages();
      
      const pusher = getPusherClient();
      if (!pusher) return;
      
      const channelName = `chat-student-${user.studentProfile.id}`;
      const channel = pusher.subscribe(channelName);
      
      channel.bind('new-message', (newMessage: ChatMessage) => {
        setMessages((prev) => {
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });
      
      return () => {
        pusher.unsubscribe(channelName);
      };
    }
  }, [user]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/messages');
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
    if (!typedMessage.trim()) return;

    try {
      setSending(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: typedMessage }),
      });

      if (res.ok) {
        setTypedMessage('');
        loadMessages(); // Refresh chat
      }
    } catch (err) {
      console.error('Message failed to send:', err);
    } finally {
      setSending(false);
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

  const agent = user.studentProfile?.assignedAgent;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 h-16 shrink-0 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/student" className="text-slate-400 hover:text-cyan-600 transition-colors mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-cyan-600 font-bold border border-slate-200">
              {agent ? agent.user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{agent ? agent.user.name : 'Education Advisor'}</h2>
              <p className="text-[10px] text-slate-400 font-light tracking-wide uppercase">
                {agent ? agent.position || 'Assigned Consultant' : 'Awaiting Assignment'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/60">
          {!agent ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-400">Direct Chat Disabled</p>
              <p className="text-xs text-slate-400 font-light max-w-xs">
                You will be able to message your counselor as soon as an agent is assigned to your application profile.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-light text-xs">
              No messages exchanged yet. Send a message to start the conversation!
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

        {/* Input area */}
        {agent && (
          <div className="bg-white border-t border-slate-200 p-4 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message here..."
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
        )}

      </main>
    </div>
  );
}
