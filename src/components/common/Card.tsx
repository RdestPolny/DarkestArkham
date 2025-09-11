import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-stone-900/70 border-2 border-stone-800 p-4 shadow-lg shadow-black/30 ${className}`}>
      {children}
    </div>
  );
};
