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
  placeholder = 'फ़िल्टर करें...',
  label = 'Filter'
}) => {
  const id = useId();

  return (
    <div className="relative font-['Mukta']">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
        <Filter className="w-4 h-4" />
      </div>
      <select
        id={id}
        className="pl-9 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all cursor-pointer"
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
