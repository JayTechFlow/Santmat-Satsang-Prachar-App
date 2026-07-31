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
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
        value={internalValue}
        onChange={handleChange}
        style={{ paddingLeft: '44px' }}
      />
    </div>
  );
};
