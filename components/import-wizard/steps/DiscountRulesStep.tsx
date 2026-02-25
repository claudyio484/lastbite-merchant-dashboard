import React, { useEffect, useState } from 'react';
import { ImportState, ImportAction } from '../../../types/import.types';
import { DiscountTable } from '../components/DiscountTable';
import { generatePreview } from '../../../services/importService';
import { ChevronDown, Loader2 } from 'lucide-react';

interface DiscountRulesStepProps {
  state: ImportState;
  dispatch: React.Dispatch<ImportAction>;
}

export const DiscountRulesStep: React.FC<DiscountRulesStepProps> = ({ state, dispatch }) => {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (!state.rawRows || state.rawRows.length === 0) return;

    const updatePreview = async () => {
      setIsLoadingPreview(true);
      try {
        const preview = await generatePreview(state);
        dispatch({ type: 'SET_PREVIEW', payload: preview });
      } catch (err: any) {
        console.error('[DiscountRulesStep] Preview generation failed:', err);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const timer = setTimeout(updatePreview, 500);
    return () => clearTimeout(timer);
  }, [state.discountRules, state.roundPrices]);

  // Calculate distribution for bar chart
  const distribution = React.useMemo(() => {
    if (!state.preview?.items) return { red: 0, orange: 0, yellow: 0 };
    
    let red = 0, orange = 0, yellow = 0;
    state.preview.items.forEach(item => {
        if (item.discount >= 90) red++;
        else if (item.discount >= 50) orange++;
        else if (item.discount >= 20) yellow++;
    });
    return { red, orange, yellow };
  }, [state.preview]);

  const total = (distribution.red + distribution.orange + distribution.yellow) || 1; // avoid div by zero

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex-1 space-y-8 py-2">
        
        {/* Rules Table */}
        <div className="transition-all duration-300">
            <DiscountTable 
                rules={state.discountRules}
                onUpdateRule={(id, field, value) => dispatch({ type: 'UPDATE_RULE', payload: { id, field, value } })}
                onDeleteRule={(id) => dispatch({ type: 'DELETE_RULE', payload: id })}
                onAddRule={() => dispatch({ type: 'ADD_RULE', payload: { id: Date.now().toString(), days: 1, discount: 10 } })}
            />
        </div>

        {/* Round Prices Toggle */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-800">
            <div>
                <label className="text-sm font-bold text-gray-900 dark:text-white block">
                    Round prices to nearest .90
                </label>
                <p className="text-xs text-gray-500 mt-0.5">9.87 AED → 9.90 AED</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_ROUND_PRICES' })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                ${state.roundPrices ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.roundPrices ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
        </div>

        {/* Distribution Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                Estimated distribution across {state.preview?.nearExpiryRetained || 0} products
            </h4>
            
            {isLoadingPreview && !state.preview ? (
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-full"></div>
            ) : (
                <>
                    <div className="h-4 w-full flex rounded-full overflow-hidden mb-4">
                        <div style={{ width: `${(distribution.red / total) * 100}%` }} className="bg-rose-500 h-full transition-all duration-500"></div>
                        <div style={{ width: `${(distribution.orange / total) * 100}%` }} className="bg-orange-500 h-full transition-all duration-500"></div>
                        <div style={{ width: `${(distribution.yellow / total) * 100}%` }} className="bg-amber-400 h-full transition-all duration-500"></div>
                    </div>
                    
                    <div className="flex gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{distribution.red} at 90%+</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{distribution.orange} at 50-89%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{distribution.yellow} at 20-49%</span>
                        </div>
                    </div>
                </>
            )}
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
