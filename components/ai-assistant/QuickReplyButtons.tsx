'use client';

import React from 'react';
import type { QuickReply } from '@/types/ai-assistant';

interface QuickReplyButtonsProps {
  replies: QuickReply[];
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
}

export function QuickReplyButtons({ replies, onSelect, disabled }: QuickReplyButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-2 mb-3">
      {replies.map((reply) => (
        <button
          key={reply.value}
          disabled={disabled}
          onClick={() => onSelect(reply.value, reply.label)}
          className="
            px-3 py-2 text-sm rounded-full border border-blue-200
            bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-400
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-95 shadow-sm
          "
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
