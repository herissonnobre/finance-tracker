import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props}, ref) => {
    return (
      <div className='space-y-1'>
        {label && <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>{label}</label>}
        <input ref={ref} {...props} className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:border-transparent ${className}`}/>
        {error && <p className='text-sm text-red-500'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';