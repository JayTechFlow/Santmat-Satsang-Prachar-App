export const required = (value: any): string | null => {
  if (value === null || value === undefined) return 'Field is required';
  if (typeof value === 'string' && value.trim() === '') return 'Field is required';
  if (Array.isArray(value) && value.length === 0) return 'Field is required';
  return null;
};

export const maxLength = (length: number) => (value: string): string | null => {
  if (value && value.length > length) return `Maximum length is ${length} characters`;
  return null;
};

export const minLength = (length: number) => (value: string): string | null => {
  if (value && value.length < length) return `Minimum length is ${length} characters`;
  return null;
};

export const allowedExtensions = (extensions: string[]) => (file: File | null): string | null => {
  if (!file) return null;
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !extensions.includes(fileExt)) {
    return `Allowed extensions are: ${extensions.join(', ')}`;
  }
  return null;
};

export const maxFileSize = (sizeInMB: number) => (file: File | null): string | null => {
  if (!file) return null;
  const sizeInBytes = sizeInMB * 1024 * 1024;
  if (file.size > sizeInBytes) {
    return `Maximum file size is ${sizeInMB}MB`;
  }
  return null;
};

// duplicateTitle can be tricky since it requires DB access, we can create an async validator interface
export const duplicateTitle = async (
  title: string,
  checkFn: (title: string) => Promise<boolean>
): Promise<string | null> => {
  if (!title) return null;
  const isDuplicate = await checkFn(title);
  return isDuplicate ? 'A record with this title already exists' : null;
};
