import type { ReactNode } from 'react';

interface PreviewPanelProps {
  children: ReactNode;
}

export default function PreviewPanel({ children }: PreviewPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {children}
    </div>
  );
}
