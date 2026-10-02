import React from 'react';

export interface AdminFieldProps {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const AdminField: React.FC<AdminFieldProps> = ({
  label,
  required = false,
  helperText,
  error,
  children,
  className = '',
  htmlFor,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs sm:text-sm font-semibold text-stone-800"
      >
        {label}
        {required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>

      {children}

      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-stone-500 leading-relaxed mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminFormSection: React.FC<AdminFormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 pt-4 first:pt-0 ${className}`}>
      <div className="border-b border-stone-100 pb-2">
        <h4 className="text-sm sm:text-base font-bold text-stone-900">{title}</h4>
        {description && (
          <p className="text-xs text-stone-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </div>
  );
};
