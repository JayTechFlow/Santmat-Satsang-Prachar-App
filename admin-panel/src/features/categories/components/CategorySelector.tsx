import React, { useMemo } from 'react';
import type { CategoryDTO } from '../types';
import { buildCategoryTree, flattenTree } from '../utils/tree';

export interface CategorySelectorProps {
  categories: CategoryDTO[];
  value: string;
  onChange: (value: string) => void;
  typeFilter?: string;
  disabled?: boolean;
  placeholder?: string;
  excludeId?: string; // e.g. to prevent a category from being its own parent
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  value,
  onChange,
  typeFilter,
  disabled,
  placeholder = 'Select a category...',
  excludeId
}) => {
  const options = useMemo(() => {
    let filtered = categories;
    if (typeFilter) {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    
    // We can't select self or descendants as parent
    // To properly exclude descendants, we can build the tree, prune the excluded node, and flatten
    const tree = buildCategoryTree(filtered);
    
    // Function to filter out node and its descendants
    const filterTree = (nodes: any[]): any[] => {
      if (!excludeId) return nodes;
      return nodes
        .filter(n => n.id !== excludeId)
        .map(n => ({
          ...n,
          children: filterTree(n.children)
        }));
    };
    
    const safeTree = filterTree(tree);
    return flattenTree(safeTree);
  }, [categories, typeFilter, excludeId]);

  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {'\u00A0'.repeat(opt.level * 4)}{opt.name}
        </option>
      ))}
    </select>
  );
};
