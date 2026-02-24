'use client';

import dynamic from 'next/dynamic';

// Dynamic import keeps the AI assistant out of the initial JS bundle.
// It loads lazily after the page hydrates.
const AiAssistantWidget = dynamic(
  () =>
    import('@/components/ai-assistant/AiAssistantWidget').then(
      (mod) => mod.AiAssistantWidget
    ),
  { ssr: false }
);

export function AiAssistantLoader() {
  return <AiAssistantWidget />;
}
