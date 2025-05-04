import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full
            bg-dark-200
            border
            ${error ? 'border-error' : 'border-dark-100'}
            text-white
            rounded-md
            py-2
            px-3
            focus:outline-none
            focus:ring-2
            focus:ring-primary-500
            placeholder:text-neutral-500
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;