import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ pagination, current, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={current === 1} onClick={() => onPageChange(current - 1)}
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors">
        <FaChevronLeft className="text-sm" />
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
          let p = current;
          if (current <= 3) p = i + 1;
          else if (current >= pagination.pages - 2) p = pagination.pages - 4 + i;
          else p = current - 2 + i;
          if (p > 0 && p <= pagination.pages) {
            return (
              <button key={p} onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                  current === p ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}>
                {p}
              </button>
            );
          }
          return null;
        })}
      </div>
      <button disabled={current === pagination.pages} onClick={() => onPageChange(current + 1)}
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-colors">
        <FaChevronRight className="text-sm" />
      </button>
    </div>
  );
};

export default Pagination;
