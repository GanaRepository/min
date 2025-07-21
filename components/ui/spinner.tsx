import React from 'react';

export default function Spinner({ size }: { size: 'small' | 'large' }) {
  const spinnerSize = size === 'large' ? 'h-8 w-8' : 'h-4 w-4';
  return (
    <div
      className={`animate-spin rounded-full border-2 border-solid border-blue-500 border-t-transparent ${spinnerSize}`}
    ></div>
  );
}
