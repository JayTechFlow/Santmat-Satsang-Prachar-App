import React, { useMemo } from 'react';
import type { CategoryDTO } from '../types';
import { ChevronRight } from 'lucide-react';

export interface CategoryBreadcrumbProps {
  categories: CategoryDTO[];
  categoryId: string;
}

export const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ categories, categoryId }) => {
  const breadcrumbs = useMemo(() => {
    const path: CategoryDTO[] = [];
    let current = categories.find(c => c.id === categoryId);
    
    // Prevent infinite loops just in case there's bad data
    const visited = new Set<string>();
    
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current);
      current = categories.find(c => c.id === current?.parentId);
    }
    
    return path;
  }, [categories, categoryId]);

  if (breadcrumbs.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '0.875rem' }}>
      {breadcrumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.id}>
          <span style={{ 
            color: idx === breadcrumbs.length - 1 ? 'var(--text-heading)' : 'var(--text-muted)',
            fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
          }}>
            {crumb.name}
          </span>
          {idx < breadcrumbs.length - 1 && (
            <ChevronRight size={14} color="var(--text-muted)" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
