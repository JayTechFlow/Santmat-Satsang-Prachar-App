import React, { useState, useId, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  value?: string;
  label?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'खोजें (Search)...',
  onSearch,
  value,
  label = 'Search'
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(val);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative w-full font-['Mukta']">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        id={id}
        type="text"
        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
      />
    </div>
  );
};
