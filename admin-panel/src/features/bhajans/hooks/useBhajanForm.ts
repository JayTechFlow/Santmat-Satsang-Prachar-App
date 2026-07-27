import { useState, useCallback } from 'react';

export interface BhajanFormData {
  title: string;
  description: string;
  audioUrl: string;
  thumbnailUrl: string;
  lyrics: string;
}

const defaultForm: BhajanFormData = {
  title: '',
  description: '',
  audioUrl: '',
  thumbnailUrl: '',
  lyrics: ''
};

export function useBhajanForm(initialData?: Partial<BhajanFormData>) {
  const [formData, setFormData] = useState<BhajanFormData>({
    ...defaultForm,
    ...initialData
  });
  const [isDirty, setIsDirty] = useState(false);

  const setField = useCallback((field: keyof BhajanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const reset = useCallback((data?: Partial<BhajanFormData>) => {
    setFormData({ ...defaultForm, ...data });
    setIsDirty(false);
  }, []);

  const validate = useCallback(() => {
    if (!formData.title.trim()) {
      return "Title is required";
    }
    return null;
  }, [formData]);

  return {
    formData,
    setField,
    reset,
    isDirty,
    validate
  };
}
