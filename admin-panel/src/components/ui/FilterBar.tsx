import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterBarProps {
  options: FilterOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Filter by...'
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
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
        <Filter size={20} />
      </div>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingLeft: '44px', appearance: 'none' }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
