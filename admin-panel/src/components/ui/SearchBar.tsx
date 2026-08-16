import React, { useState, useId } from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  value?: string;
  label?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  value,
  label = 'Search'
}) => {
  const [internalValue, setInternalValue] = useState(value || '');
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  React.useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(val);
    }, 500);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="searchbar">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <div className="searchbar-icon" aria-hidden="true">
        <Search size={20} />
      </div>
      <input
        id={id}
        type="text"
        className="form-input searchbar-input"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
      />
    </div>
  );
};