import { forwardRef, type ReactNode, useEffect, type HTMLAttributes } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

export interface CheckboxProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      required,
      id,
      className = '',
      style,
      checked,
      onChange,
      disabled,
      name,
      value,
      ...props
    },
    ref
  ) => {
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <div className="checkbox-field" style={style}>
        <label htmlFor={id} className="checkbox-label">
          <CheckboxPrimitive.Root
            ref={ref}
            id={id}
            className={`checkbox-root ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            aria-describedby={descriptionId}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            name={name}
            value={value}
            {...props}
          >
            <CheckboxPrimitive.Indicator className="checkbox-indicator">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
          {label && (
            <span className="checkbox-label-text">
              {label}
              {required && <span className="text-danger" aria-hidden="true">*</span>}
            </span>
          )}
        </label>
        {description && <p className="form-description" id={`${id}-description`}>{description}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface RadioGroupProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  name: string;
}

export function RadioGroup({
  label,
  description,
  error,
  required,
  options,
  value,
  onValueChange,
  direction = 'vertical',
  name,
}: RadioGroupProps) {
  const errorId = error ? `radio-error-${name}` : undefined;

  return (
    <fieldset className="radio-group-field" aria-invalid={error ? 'true' : 'false'}>
      {label && (
        <legend className="form-label">
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
        </legend>
      )}
      <div
        className={`radio-group ${direction === 'horizontal' ? 'radio-group-horizontal' : ''}`}
        role="radiogroup"
        aria-labelledby={error ? undefined : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
      >
        {options.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onValueChange?.(option.value)}
              disabled={option.disabled}
              className="radio-input"
              aria-disabled={option.disabled}
            />
            <span className="radio-indicator" aria-hidden="true">
              <span className="radio-dot" />
            </span>
            <span className="radio-label-text">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
      {description && !error && <p className="form-description">{description}</p>}
    </fieldset>
  );
}

export interface SwitchProps extends HTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      description,
      error,
      id,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`switch-field ${className}`} style={style}>
        <label htmlFor={id} className="switch-label">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={id}
            className="switch-input"
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
          {label && <span className="switch-label-text">{label}</span>}
        </label>
        {description && <p className="form-description">{description}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function FormField({
  label,
  error,
  description,
  required,
  children,
  className = '',
  style,
}: FormFieldProps) {
  const fieldId = `field-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <div className={`form-field ${className}`} style={style}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
        </label>
      )}
      <div aria-describedby={[error ? errorId : undefined, description ? descriptionId : undefined].filter(Boolean).join(' ') || undefined}>
        {children}
      </div>
      {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
      {description && !error && <p id={descriptionId} className="form-description">{description}</p>}
    </div>
  );
}

export interface SearchInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  error?: string;
}

export function SearchInput({
  label,
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  error,
}: SearchInputProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  return (
    <div className="search-input-field">
      {label && (
        <label className="visually-hidden" htmlFor="search-input">
          {label}
        </label>
      )}
      <div className="search-input-wrapper">
        <span className="search-input-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          id="search-input"
          type="search"
          className="form-input search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-label={label}
        />
        {value && (
          <button
            type="button"
            className="search-clear-button"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}