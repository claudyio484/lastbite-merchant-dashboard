import React, { useState } from 'react';
import { ImportState, ImportAction } from '../../../types/import.types';
import { PreviewTable } from '../components/PreviewTable';
import { confirmImport } from '../../../services/importService';
import { CheckCircle2, Loader2, ArrowLeft, Save } from 'lucide-react';

interface ValidationStepProps {
  state: ImportState;
  dispatch: React.Dispatch<ImportAction>;
  onClose: () => void;
}

const PROGRESS_STEPS = [
  'Normalizing data...',
  'Applying discount rules...',
  'Creating products...',
  'Saving to Products...',
];

export const ValidationStep: React.FC<ValidationStepProps> = ({ state, dispatch, onClose }) => {
  const [progressStep, setProgressStep] = useState(0);

  const handleConfirm = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'confirming' });

    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
        setProgressStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
        await confirmImport(state);
        dispatch({ type: 'SET_STATUS', payload: 'success' });
    } catch (e) {
        console.error('[ValidationStep] Import failed:', e);
        dispatch({ type: 'SET_STATUS', payload: 'error' });
    }
  };

  if (state.status === 'confirming' || state.status === 'success') {
      return (
          <div className="flex flex-col items-center justify-center h-full py-12">
              {state.status === 'confirming' ? (
                  <div className="space-y-6 w-full max-w-md">
                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-8">Processing Import...</h3>
                      <div className="space-y-4">
                          {PROGRESS_STEPS.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                  {progressStep > idx ? (
                                      <div className="text-emerald-500"><CheckCircle2 size={20} /></div>
                                  ) : progressStep === idx ? (
                                      <div className="text-emerald-600 animate-spin"><Loader2 size={20} /></div>
                                  ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
                                  )}
                                  <span className={`font-medium ${progressStep === idx ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                      {step}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
              ) : (
                  <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 size={40} strokeWidth={3} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Import complete</h2>
                          <p className="text-gray-500 dark:text-gray-400">
                              {state.preview?.dealCount || 0} products saved to your inventory
                          </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20"
                      >
                          View Products
                      </button>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary Bar */}
      <div className="flex gap-3 mb-6">
        <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
            {state.preview?.dealCount || 0} products
        </div>
        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700">
            Total retail {state.preview?.totalRetail?.toLocaleString() || 0} AED
        </div>
        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700">
            Total final {state.preview?.totalFinal?.toLocaleString() || 0} AED
        </div>
      </div>

      {/* Table Preview */}
      <div className="flex-1 min-h-0 mb-6">
          {state.preview?.items && <PreviewTable items={state.preview.items} />}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handleConfirm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Save size={18} /> Save
        </button>
      </div>
    </div>
  );
};
