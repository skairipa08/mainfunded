'use client';

import React from 'react';
import type { ChatMessage } from '@/types/ai-assistant';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === 'bot';

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isBot ? 'justify-start' : 'justify-end'
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 mt-1">
          <span className="text-white text-sm">🎓</span>
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
          isBot
            ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
            : 'bg-blue-600 text-white rounded-tr-sm'
        )}
      >
        {message.text}
      </div>
    </div>
  );
}
