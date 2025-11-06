import * as React from 'react';

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.991v4.99"
    />
  </svg>
);

export const PabloAvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <g>
        {/* Skin */}
        <circle cx="50" cy="55" r="30" fill="#f7d4b4" />
        {/* Hair */}
        <path d="M 35,30 C 25,30 20,45 25,55 C 30,45 40,40 50,40 C 60,40 70,45 75,55 C 80,45 75,30 65,30 Z" fill="#332a22" />
        {/* Sombrero */}
        <ellipse cx="50" cy="30" rx="45" ry="12" fill="#d2b48c" />
        <ellipse cx="50" cy="28" rx="20" ry="10" fill="#a0522d" />
        <path d="M30,28 Q50,20 70,28 A20,10 0 0,1 30,28" fill="#c48a4f" />
        {/* Eyes */}
        <circle cx="40" cy="55" r="4" fill="#222" />
        <circle cx="60" cy="55" r="4" fill="#222" />
         {/* Mustache */}
        <path d="M 35 68 C 40 65, 60 65, 65 68 C 60 75, 40 75, 35 68 Z" fill="#332a22"/>
      </g>
    </svg>
);


export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

export const StopCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563C9.252 14.437 9 14.185 9 13.874V9.563z" />
    </svg>
);