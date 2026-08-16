import React, { useId } from 'react';
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
  label?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Filter by...',
  label = 'Filter'
}) => {
  const id = useId();

  return (
    <div className="filterbar">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <div className="filterbar-icon" aria-hidden="true">
        <Filter size={20} />
      </div>
      <select
        id={id}
        className="form-select filterbar-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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