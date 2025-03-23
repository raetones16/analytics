'use client';

import React from 'react';

interface EditLayoutButtonProps {
  isEditing: boolean;
  onClick: () => void;
}

export function EditLayoutButton({ isEditing, onClick }: EditLayoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center px-3 py-1.5 rounded font-medium transition-colors shadow-sm text-sm
        ${isEditing 
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300 border' 
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 border'}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="mr-1.5"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
      {isEditing ? 'Editing Layout' : 'Edit Layout'}
    </button>
  );
}
