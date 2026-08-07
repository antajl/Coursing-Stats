import { useState } from 'react';

interface ProgressiveDisclosureProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  compactChildren?: React.ReactNode;
}

export function ProgressiveDisclosure({
  title,
  defaultOpen = false,
  children,
  compactChildren,
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-camel-700 hover:text-camel-800 dark:text-camel-400 dark:hover:text-camel-300 transition-colors"
        aria-expanded={isOpen}
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {title}
      </button>
      <div className={`mt-2 ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
      {!isOpen && compactChildren && (
        <div className="mt-2">
          {compactChildren}
        </div>
      )}
    </div>
  );
}
