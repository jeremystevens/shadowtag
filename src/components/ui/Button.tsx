import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Base styles
  let variantClasses = '';
  
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-primary-600 hover:bg-primary-700 text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-secondary-600 hover:bg-secondary-700 text-white';
      break;
    case 'danger':
      variantClasses = 'bg-error hover:bg-error/90 text-white';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent hover:bg-dark-200 text-neutral-300 hover:text-white';
      break;
    default:
      variantClasses = 'bg-primary-600 hover:bg-primary-700 text-white';
  }
  
  let sizeClasses = '';
  
  switch (size) {
    case 'sm':
      sizeClasses = 'text-sm px-3 py-1.5 rounded';
      break;
    case 'md':
      sizeClasses = 'text-sm px-4 py-2 rounded-md';
      break;
    case 'lg':
      sizeClasses = 'text-base px-6 py-3 rounded-lg';
      break;
    default:
      sizeClasses = 'text-sm px-4 py-2 rounded-md';
  }
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`
        ${variantClasses}
        ${sizeClasses}
        ${widthClass}
        font-medium
        transition-colors
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-offset-dark-300
        focus:ring-primary-500
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;