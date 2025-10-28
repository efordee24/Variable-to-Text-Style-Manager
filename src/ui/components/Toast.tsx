import React from 'react';

interface ToastProps {
  message: string;
  variant: 'success' | 'error' | 'info';
  visible: boolean;
}

export function Toast({ message, variant, visible }: ToastProps) {
  if (!message) return null;

  return (
    <div className={`toast ${variant} ${visible ? 'visible' : ''}`}>
      {message}
    </div>
  );
}
