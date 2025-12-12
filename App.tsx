import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Leaf } from 'lucide-react';
import { sendMessageToGemini, startChat } from './services/geminiService';
import { Message, ChatStatus, ChatSession } from './types';
import { MessageBubble } from './components/MessageBubble';
import { QuickActions } from './components/QuickActions';
import { Sidebar } from './components/Sidebar';

const STORAGE_KEY = 'union-sheba-history';

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedSessions = JSON.parse(saved);
        setSessions(parsedSessions);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    // Don't auto-create a session. Start empty.
    startChat([]); 
  }, []);

  // Save history whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      // Reset height to auto to correctly calculate scrollHeight for shrinking content
      inputRef.current.style.height = 'auto';
      // Set new height based on scrollHeight
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const createNewSession = (firstMessageText: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: firstMessageText.length > 30 ? firstMessageText.substring(0, 30) + '...' : firstMessageText,
      messages: [],
      createdAt: Date.now()
    };
    return newSession;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || status !== 'idle') return;

    let activeSessionId = currentSessionId;
    let currentMessages = [...messages];

    // If no session active, create one now
    if (!activeSessionId) {
      const newSession = createNewSession(text);
      activeSessionId = newSession.id;
      setCurrentSessionId(activeSessionId);
      setSessions(prev => [...prev, newSession]);
      // Initialize gemini chat with empty history for new session
      startChat([]); 
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
    };

    const updatedMessagesWithUser = [...currentMessages, userMessage];
    setMessages(updatedMessagesWithUser);
    
    // Update session in storage
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, messages: updatedMessagesWithUser } : s
    ));

    setInputText('');
    setStatus('loading');

    // AI Placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = {
      id: aiMessageId,
      role: 'model',
      text: '',
      isStreaming: true
    };
    
    const messagesWithPlaceholder = [...updatedMessagesWithUser, aiPlaceholder];
    setMessages(messagesWithPlaceholder);

    try {
      const stream = sendMessageToGemini(text);
      let accumulatedText = '';

      for await (const chunk of stream) {
        setStatus('streaming');
        accumulatedText += chunk;
        
        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      }
      
      // Finalize
      setMessages((prev) => {
        const finalMessages = prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        );
        
        // Update session in storage with final AI response
        setSessions(sPrev => sPrev.map(s => 
          s.id === activeSessionId ? { ...s, messages: finalMessages } : s
        ));
        
        return finalMessages;
      });

    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setStatus('idle');
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    startChat([]); // Reset Gemini context
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    startChat(session.messages); // Restore Gemini context
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      handleNewChat();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar History */}
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        
        {/* Header - Glassmorphism */}
        <header className="flex-none absolute top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-md border-b border-white/50 px-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center text-white shadow-emerald-200 shadow-lg">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">ইউনিয়ন সেবা</h1>
              <p className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase mt-0.5">Premium AI Agent</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto pt-20 pb-40 px-4 md:px-0">
          <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50 pb-20">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
                   <Leaf size={40} />
                </div>
                <p className="text-slate-400 font-medium">নতুন চ্যাট শুরু করুন</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent pt-6 pb-6 px-4">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            
            {/* Quick Navigation Scroll */}
            <QuickActions onSelect={handleSendMessage} disabled={status !== 'idle'} />

            {/* Input Field */}
            <div className="relative flex items-end gap-2 bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 ring-4 ring-transparent focus-within:ring-emerald-50/50 focus-within:border-emerald-200 transition-all duration-300">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="কিভাবে সাহায্য করতে পারি?..."
                disabled={status !== 'idle'}
                className="flex-1 max-h-32 min-h-[52px] py-3.5 px-6 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none outline-none disabled:opacity-50 text-base leading-relaxed"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || status !== 'idle'}
                className="flex-none w-12 h-12 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full hover:shadow-lg hover:shadow-emerald-200 disabled:bg-none disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 mb-0.5"
              >
                {status === 'loading' || status === 'streaming' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={22} className="ml-0.5" />
                )}
              </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-medium">
              AI এর তথ্য যাচাই করে নিন। জরুরি প্রয়োজনে দপ্তরে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;