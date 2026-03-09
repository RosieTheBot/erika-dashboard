import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-white"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full
            bg-primary-900
            border
            ${error ? 'border-red-500' : 'border-primary-700'}
            rounded-lg
            px-4 py-2
            ${icon ? 'pl-10' : ''}
            text-white
            placeholder-primary-500
            focus:outline-none
            focus:border-primary-500
            focus:ring-2
            focus:ring-primary-500/20
            transition
            disabled:bg-primary-800
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-xs text-primary-400">{helperText}</p>
      )}
    </div>
  )
}
