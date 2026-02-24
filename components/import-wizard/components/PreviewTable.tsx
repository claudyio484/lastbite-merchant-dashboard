import React, { useState } from 'react';
import { ImportPreviewItem } from '../../../types/import.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PreviewTableProps {
  items: ImportPreviewItem[];
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ items }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const getRowStyle = (daysLeft: number) => {
    if (daysLeft <= 2) return 'bg-rose-50 dark:bg-rose-900/10';
    if (daysLeft <= 3) return 'bg-amber-50 dark:bg-amber-900/10';
    return '';
  };

  const getBadgeStyle = (daysLeft: number) => {
    if (daysLeft <= 2) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    if (daysLeft <= 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Expiry Date</th>
              <th className="px-4 py-3">Days Left</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Original</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Final Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {currentItems.map((item) => (
              <tr key={item.id} className={getRowStyle(item.daysLeft)}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(item.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getBadgeStyle(item.daysLeft)}`}>
                    {item.daysLeft} days
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{item.quantity}</td>
                <td className="px-4 py-3 text-gray-500 line-through">AED {item.originalPrice.toFixed(2)}</td>
                <td className="px-4 py-3 font-bold text-rose-600">-{item.discount}%</td>
                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">AED {item.finalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 mt-4">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
