import React, { useState } from 'react';
import { ImportState, ImportAction } from '../../../types/import.types';
import { PreviewTable } from '../components/PreviewTable';
import { confirmImport } from '../../../services/importService';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

interface ValidationStepProps {
  state: ImportState;
  dispatch: React.Dispatch<ImportAction>;
  onClose: () => void;
}

export const ValidationStep: React.FC<ValidationStepProps> = ({ state, dispatch, onClose }) => {
  const [progressStep, setProgressStep] = useState(0);
  
  const handleConfirm = async () => {
    dispatch({ type: 'SET_STATUS', payload: 'confirming' });
    
    // Simulate progress steps
    const steps = ['Normalizing data...', 'Applying discount rules...', 'Creating deals...', 'Publishing to marketplace...'];
    
    for (let i = 0; i < steps.length; i++) {
        setProgressStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
        await confirmImport(state);
        dispatch({ type: 'SET_STATUS', payload: 'success' });
    } catch (e) {
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
                          {['Normalizing data...', 'Applying discount rules...', 'Creating deals...', 'Publishing to marketplace...'].map((step, idx) => (
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
                              {state.preview?.dealCount} deals created — {state.publishMode === 'publish' ? '18 published, 108 drafts' : '0 published, 126 drafts'}
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
            {state.preview?.dealCount} deals
        </div>
        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700">
            Total retail {state.preview?.totalRetail.toLocaleString()} AED
        </div>
        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700">
            Total final {state.preview?.totalFinal.toLocaleString()} AED
        </div>
      </div>

      {/* Table Preview */}
      <div className="flex-1 min-h-0 mb-6">
          {state.preview?.items && <PreviewTable items={state.preview.items} />}
      </div>

      {/* Publish Options */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          <div 
            onClick={() => dispatch({ type: 'SET_PUBLISH_MODE', payload: 'publish' })}
            className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all
                ${state.publishMode === 'publish' 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-900/50'}
            `}
          >
              <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${state.publishMode === 'publish' ? 'border-emerald-600' : 'border-gray-400'}`}>
                      {state.publishMode === 'publish' && <div className="w-2 h-2 rounded-full bg-emerald-600"></div>}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Publish immediately</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">Deals go live on the marketplace right away</p>
          </div>

          <div 
            onClick={() => dispatch({ type: 'SET_PUBLISH_MODE', payload: 'draft' })}
            className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all
                ${state.publishMode === 'draft' 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-900/50'}
            `}
          >
              <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${state.publishMode === 'draft' ? 'border-emerald-600' : 'border-gray-400'}`}>
                      {state.publishMode === 'draft' && <div className="w-2 h-2 rounded-full bg-emerald-600"></div>}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Save as draft</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">Review before publishing in Products &gt; Drafts</p>
          </div>
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
          <CheckCircle2 size={18} /> Confirm Import
        </button>
      </div>
    </div>
  );
};
