import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 py-4 border-t">
      <button
        className="btn-icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn-icon ${page === currentPage ? 'bg-primary text-surface' : ''}`}
          style={page === currentPage ? { backgroundColor: 'var(--primary)', color: 'white' } : {}}
        >
          {page}
        </button>
      ))}

      <button
        className="btn-icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
