'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';

export default function EligibilityBot({ onClose }: { onClose: () => void }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end w-full max-w-sm sm:max-w-md pointer-events-none p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col h-[600px] max-h-[80vh] overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 duration-300 pointer-events-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/20 p-2 rounded-xl">
              <Bot className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Eligibility Assistant</h3>
              <p className="text-xs text-slate-300 font-light">Powered by EduAgent AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
          
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-500 p-6">
              <div className="bg-cyan-100 p-4 rounded-full">
                <MessageSquare className="h-8 w-8 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Hi! I'm your Eligibility Assistant.</p>
                <p className="text-sm font-light mt-1">Ask me anything about education, university admissions, visas, or PR pathways!</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                
                {/* Avatar */}
                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] flex-row items-end gap-2">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-slate-200 text-slate-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm shadow-sm bg-white text-slate-800 border border-slate-100 rounded-bl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                  <span className="text-slate-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 z-10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about admissions, visas..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl px-4 py-3 transition-colors flex items-center justify-center shrink-0 shadow-sm"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="text-center mt-3">
             <p className="text-[10px] text-slate-400">AI can make mistakes. Check important information.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
