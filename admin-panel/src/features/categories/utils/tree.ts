import type { CategoryDTO } from '../types';

export interface CategoryTreeNode extends CategoryDTO {
  children: CategoryTreeNode[];
  level: number;
}

export function buildCategoryTree(categories: CategoryDTO[], parentId: string = ''): CategoryTreeNode[] {
  return categories
    .filter(cat => (cat.parentId || '') === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(cat => ({
      ...cat,
      level: 0,
      children: buildCategoryTree(categories, cat.id)
    }));
}

export function flattenTree(tree: CategoryTreeNode[], currentLevel: number = 0): CategoryTreeNode[] {
  let result: CategoryTreeNode[] = [];
  for (const node of tree) {
    const nodeWithLevel = { ...node, level: currentLevel };
    result.push(nodeWithLevel);
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, currentLevel + 1));
    }
  }
  return result;
}
