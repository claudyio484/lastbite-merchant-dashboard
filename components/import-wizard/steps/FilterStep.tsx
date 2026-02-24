import React, { useEffect, useState } from 'react';
import { ImportState, ImportAction } from '../../../types/import.types';
import { generatePreview } from '../../../services/importService';
import { Loader2, Package, CheckCircle2, AlertTriangle, Ban } from 'lucide-react';

interface FilterStepProps {
  state: ImportState;
  dispatch: React.Dispatch<ImportAction>;
}

export const FilterStep: React.FC<FilterStepProps> = ({ state, dispatch }) => {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    const updatePreview = async () => {
      setIsLoadingPreview(true);
      try {
        const preview = await generatePreview(state);
        dispatch({ type: 'SET_PREVIEW', payload: preview });
      } finally {
        setIsLoadingPreview(false);
      }
    };
    
    // Debounce preview update
    const timer = setTimeout(updatePreview, 500);
    return () => clearTimeout(timer);
  }, [state.windowDays, state.includeExpired]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex-1 space-y-10 py-4">
        
        {/* Window Input */}
        <div className="space-y-4">
          <label className="text-lg font-medium text-gray-900 dark:text-white block">
            Define your near-expiry window
          </label>
          <div className="flex items-baseline gap-3 text-2xl text-gray-600 dark:text-gray-300">
            <span>Only include products expiring within</span>
            <input
              type="number"
              min={1}
              max={90}
              value={state.windowDays}
              onChange={(e) => dispatch({ type: 'SET_WINDOW_DAYS', payload: parseInt(e.target.value) || 0 })}
              className="w-20 text-center font-bold border-b-2 border-emerald-500 bg-transparent focus:outline-none text-gray-900 dark:text-white"
            />
            <span>days</span>
          </div>
          <p className="text-sm text-gray-500">Products beyond this window will be ignored</p>
        </div>

        {/* Expired Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-base font-medium text-gray-900 dark:text-white block">
                Include already-expired products
              </label>
              <p className="text-sm text-gray-500 mt-1">They will be flagged for automatic removal, not published</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_INCLUDE_EXPIRED' })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                ${state.includeExpired ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.includeExpired ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          
          {state.includeExpired && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle size={16} /> Expired products will be queued for removal from your inventory
            </div>
          )}
        </div>

        {/* Preview Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-1 shadow-2xl border border-slate-800 ring-1 ring-white/10">
          {isLoadingPreview && !state.preview ? (
             <div className="flex items-center justify-center h-48">
                 <Loader2 className="animate-spin text-slate-500" size={32} />
             </div>
          ) : (
            <div className="grid grid-cols-2 bg-slate-800/50 rounded-xl overflow-hidden gap-px border border-slate-800/50">
                <div className="bg-slate-900 p-6 flex flex-col justify-between group hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                        <Package size={14} className="text-indigo-400" />
                        <span>Total rows</span>
                    </div>
                    <div className="text-4xl font-mono font-medium tracking-tight">{state.preview?.totalRows || 0}</div>
                </div>
                
                <div className="bg-slate-900 p-6 flex flex-col justify-between group hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                        <CheckCircle2 size={14} />
                        <span>Retained</span>
                    </div>
                    <div className="text-4xl font-mono font-medium tracking-tight text-emerald-400">{state.preview?.nearExpiryRetained || 0}</div>
                </div>

                {state.includeExpired ? (
                    <div className="bg-slate-900 p-6 flex flex-col justify-between group hover:bg-slate-800/80 transition-colors animate-in fade-in">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <AlertTriangle size={14} />
                            <span>Expired</span>
                        </div>
                        <div className="text-4xl font-mono font-medium tracking-tight text-amber-400">{state.preview?.alreadyExpired || 0}</div>
                    </div>
                ) : (
                    <div className="bg-slate-900 p-6 flex flex-col justify-between group hover:bg-slate-800/80 transition-colors">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <Ban size={14} />
                            <span>Ignored</span>
                        </div>
                        <div className="text-4xl font-mono font-medium tracking-tight text-slate-500">{state.preview?.ignored || 0}</div>
                    </div>
                )}
                
                {state.includeExpired ? (
                    <div className="bg-slate-900 p-6 flex flex-col justify-between group hover:bg-slate-800/80 transition-colors">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <Ban size={14} />
                            <span>Ignored</span>
                        </div>
                        <div className="text-4xl font-mono font-medium tracking-tight text-slate-500">{state.preview?.ignored || 0}</div>
                    </div>
                ) : (
                    <div className="bg-slate-900 p-6 flex flex-col justify-center items-center text-center group hover:bg-slate-800/80 transition-colors">
                        <div className="text-slate-600 text-xs mb-1">Expired products hidden</div>
                        <button 
                            onClick={() => dispatch({ type: 'TOGGLE_INCLUDE_EXPIRED' })}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30 underline-offset-2"
                        >
                            Show expired
                        </button>
                    </div>
                )}
            </div>
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
