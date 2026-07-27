import React, { useState } from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  value?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  value
}) => {
  const [internalValue, setInternalValue] = useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    onSearch(val);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 'var(--space-16)',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <Search size={20} />
      </div>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        style={{ paddingLeft: '44px' }}
      />
    </div>
  );
};
