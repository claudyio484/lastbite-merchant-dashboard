import React from 'react';
import { DiscountRule } from '../../../types/import.types';
import { Trash2, AlertTriangle, Plus } from 'lucide-react';

interface DiscountTableProps {
  rules: DiscountRule[];
  onUpdateRule: (id: string, field: keyof DiscountRule, value: number) => void;
  onDeleteRule: (id: string) => void;
  onAddRule: () => void;
}

export const DiscountTable: React.FC<DiscountTableProps> = ({
  rules,
  onUpdateRule,
  onDeleteRule,
  onAddRule,
}) => {
  return (
    <div className="w-full">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 w-1/2">Days before expiry</th>
              <th className="px-4 py-3 w-1/3">Discount</th>
              <th className="px-4 py-3 w-1/6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {rules.map((rule) => {
              const isAggressive = rule.discount >= 90;
              return (
                <tr
                  key={rule.id}
                  className={`group transition-colors ${
                    isAggressive ? 'bg-rose-50 dark:bg-rose-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">≤</span>
                      <input
                        type="number"
                        value={rule.days}
                        onChange={(e) =>
                          onUpdateRule(rule.id, 'days', parseInt(e.target.value) || 0)
                        }
                        className="w-16 bg-transparent border-b border-dashed border-gray-300 focus:border-emerald-500 focus:outline-none text-center font-medium text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500">days</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rule.discount}
                        onChange={(e) =>
                          onUpdateRule(rule.id, 'discount', parseInt(e.target.value) || 0)
                        }
                        className={`w-16 bg-transparent border-b border-dashed border-gray-300 focus:border-emerald-500 focus:outline-none text-center font-bold ${
                          isAggressive ? 'text-rose-600' : 'text-gray-900 dark:text-white'
                        }`}
                      />
                      <span className="text-gray-500">%</span>
                      {isAggressive && (
                        <div className="group/tooltip relative ml-2">
                          <AlertTriangle size={14} className="text-rose-500" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                            Aggressive discount — check your margin
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="text-gray-400 hover:text-rose-500 transition-colors p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={onAddRule}
        className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
      >
        <Plus size={16} /> Add a tier
      </button>
    </div>
  );
};
