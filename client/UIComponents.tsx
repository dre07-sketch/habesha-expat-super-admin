import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyles = "w-full py-3.5 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-950 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-white text-night-950 hover:bg-gray-100 focus:ring-white",
    secondary: "bg-night-800 text-white border border-night-700 hover:bg-night-700 focus:ring-night-600",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 focus:ring-gray-500",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`
            w-full bg-night-900/50 border border-night-700 rounded-lg px-4 py-3.5 text-white placeholder-gray-600
            focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all duration-300
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};