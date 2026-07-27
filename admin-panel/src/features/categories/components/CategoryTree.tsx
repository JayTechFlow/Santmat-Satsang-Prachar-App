import React from 'react';
import type { CategoryDTO } from '../types';
import { buildCategoryTree } from '../utils/tree';
import type { CategoryTreeNode } from '../utils/tree';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';

export interface CategoryTreeProps {
  categories: CategoryDTO[];
  onSelect?: (category: CategoryDTO) => void;
  selectedId?: string;
}

const TreeNode: React.FC<{
  node: CategoryTreeNode;
  onSelect?: (category: CategoryDTO) => void;
  selectedId?: string;
}> = ({ node, onSelect, selectedId }) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div style={{ marginLeft: node.level === 0 ? 0 : 'var(--space-16)' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-8)',
          padding: 'var(--space-4) var(--space-8)',
          cursor: onSelect ? 'pointer' : 'default',
          backgroundColor: isSelected ? 'var(--background)' : 'transparent',
          borderRadius: 'var(--radius-input)',
          color: isSelected ? 'var(--primary)' : 'var(--text-heading)'
        }}
      >
        <div 
          onClick={(e) => { 
            if (hasChildren) {
              e.stopPropagation(); 
              setExpanded(!expanded);
            }
          }}
          style={{ width: '16px', display: 'flex', alignItems: 'center', cursor: hasChildren ? 'pointer' : 'default' }}
        >
          {hasChildren ? (expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span style={{ width: '16px' }} />}
        </div>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flex: 1 }}
          onClick={() => onSelect && onSelect(node)}
        >
          <Folder size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
          <span>{node.name}</span>
        </div>
      </div>
      {expanded && hasChildren && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              selectedId={selectedId} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, onSelect, selectedId }) => {
  const tree = React.useMemo(() => buildCategoryTree(categories), [categories]);

  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      {tree.map(node => (
        <TreeNode 
          key={node.id} 
          node={node} 
          onSelect={onSelect} 
          selectedId={selectedId} 
        />
      ))}
    </div>
  );
};
