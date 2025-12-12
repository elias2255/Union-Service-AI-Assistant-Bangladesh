import React from 'react';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';
import { TextFormatter } from './TextFormatter';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar - Bottom aligned for visual flow */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white' 
            : 'bg-white border border-gray-200 text-emerald-600'
        } shadow-md`}>
          {isUser ? <User size={16} /> : <Bot size={18} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col px-5 py-3.5 shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-br-sm' 
            : 'bg-white border border-gray-100 text-slate-700 rounded-2xl rounded-bl-sm'
        }`}>
          <TextFormatter text={message.text} />
          {message.isStreaming && (
             <span className="inline-block w-1.5 h-3 ml-1 align-middle bg-emerald-300 animate-pulse rounded-full"></span>
          )}
        </div>
      </div>
    </div>
  );
};