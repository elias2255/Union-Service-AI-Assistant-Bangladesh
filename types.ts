import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface QuickOption {
  id: string;
  label: string;
  query: string;
  icon: React.ReactNode;
}

export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'error';