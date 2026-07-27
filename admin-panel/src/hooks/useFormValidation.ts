import { useState, useCallback } from 'react';

export type ValidationRules = {
  [key: string]: {
    required?: boolean | string;
    pattern?: { value: RegExp; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    validate?: (value: any) => string | undefined;
  };
};

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      const fieldRules = rules[name as string];
      if (!fieldRules) return undefined;

      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        return typeof fieldRules.required === 'string' ? fieldRules.required : 'This field is required';
      }

      if (value) {
        if (fieldRules.pattern && !fieldRules.pattern.value.test(value)) {
          return fieldRules.pattern.message;
        }

        if (fieldRules.minLength && String(value).length < fieldRules.minLength.value) {
          return fieldRules.minLength.message;
        }

        if (fieldRules.maxLength && String(value).length > fieldRules.maxLength.value) {
          return fieldRules.maxLength.message;
        }

        if (fieldRules.validate) {
          return fieldRules.validate(value);
        }
      }

      return undefined;
    },
    [rules]
  );

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    (Object.keys(rules) as Array<keyof T>).forEach((key) => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    handleChange,
    validate,
    resetForm,
    setValues,
    setErrors,
  };
};
