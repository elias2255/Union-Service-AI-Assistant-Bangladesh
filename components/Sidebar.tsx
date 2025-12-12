import React from 'react';
import { ChatSession } from '../types';
import { MessageSquare, Trash2, Plus, X } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-emerald-900 text-emerald-50 transform transition-transform duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-emerald-800">
          <h2 className="font-bold text-lg text-white">ইতিহাস</h2>
          <button onClick={onClose} className="md:hidden p-1 hover:bg-emerald-800 rounded">
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 font-medium"
          >
            <Plus size={18} />
            <span>নতুন চ্যাট</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-emerald-400/60 mt-10 text-sm">
              কোন পূর্ববর্তী চ্যাট নেই
            </div>
          ) : (
            sessions.slice().reverse().map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  onSelectSession(session);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id 
                    ? 'bg-emerald-800 text-white' 
                    : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <MessageSquare size={16} className="shrink-0 opacity-70" />
                <span className="truncate text-sm flex-1">{session.title}</span>
                <button 
                  onClick={(e) => onDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                  title="মুছুন"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-800 text-xs text-emerald-400 text-center">
          ইউনিয়ন সেবা AI v2.0
        </div>
      </div>
    </>
  );
};