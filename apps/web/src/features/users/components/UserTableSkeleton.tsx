import React from 'react';

export const UserTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-stone-100">
          {/* User info */}
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0" />
              <div className="space-y-1.5 w-32">
                <div className="h-3.5 bg-stone-200 rounded w-24" />
                <div className="h-2.5 bg-stone-100 rounded w-32 sm:hidden" />
              </div>
            </div>
          </td>

          {/* Contact */}
          <td className="py-3 px-4 hidden sm:table-cell">
            <div className="space-y-1.5">
              <div className="h-3 bg-stone-200 rounded w-28" />
              <div className="h-2.5 bg-stone-100 rounded w-20" />
            </div>
          </td>

          {/* Role */}
          <td className="py-3 px-4">
            <div className="h-6 bg-stone-200 rounded-xl w-24" />
          </td>

          {/* Status */}
          <td className="py-3 px-4">
            <div className="h-6 bg-stone-200 rounded-xl w-16" />
          </td>

          {/* Activity / Dates */}
          <td className="py-3 px-4 hidden md:table-cell">
            <div className="space-y-1.5">
              <div className="h-3 bg-stone-200 rounded w-20" />
              <div className="h-2.5 bg-stone-100 rounded w-16" />
            </div>
          </td>

          {/* Actions */}
          <td className="py-3 px-4 text-right">
            <div className="inline-flex items-center gap-1.5 justify-end">
              <div className="w-7 h-7 bg-stone-200 rounded-lg" />
              <div className="w-7 h-7 bg-stone-200 rounded-lg" />
              <div className="w-7 h-7 bg-stone-200 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};
