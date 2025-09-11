import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 font-cinzel text-lg border-2 transform transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900';
  const variantClasses = {
    primary: 'bg-amber-800/20 border-amber-600 text-amber-400 hover:bg-amber-700/30 hover:shadow-lg active:scale-95 focus:ring-amber-500',
    secondary: 'bg-stone-700/50 border-stone-600 text-stone-300 hover:bg-stone-600/50 hover:shadow-md active:scale-95 focus:ring-stone-500',
    danger: 'bg-red-900/50 border-red-700 text-red-300 hover:bg-red-800/50 hover:shadow-lg active:scale-95 focus:ring-red-600',
  };
  const disabledClasses = 'disabled:bg-stone-800 disabled:border-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed disabled:transform-none';

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`} {...props}>
      {children}
    </button>
  );
};
