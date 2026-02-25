import React, { useState, useRef } from 'react';
import { ImportState, ImportAction } from '../../../types/import.types';
import { Upload, FileText, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { parseFile } from '../../../services/importService';

interface UploadStepProps {
  state: ImportState;
  dispatch: React.Dispatch<ImportAction>;
}

const REQUIRED_FIELDS = [
  { key: 'sku', label: 'SKU' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'price', label: 'Price' },
  { key: 'name', label: 'Product Name' },
];

const OPTIONAL_FIELDS = [
  { key: 'barcode', label: 'Barcode' },
  { key: 'category', label: 'Category' },
];

export const UploadStep: React.FC<UploadStepProps> = ({ state, dispatch }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    dispatch({ type: 'SET_FILE', payload: file });
    setIsParsing(true);
    
    try {
      const { columns, errors, rawRows } = await parseFile(file);
      // Auto-map columns based on flexible matching
      // Normalize both sides: replace underscores with spaces for comparison
      const mapping: Record<string, string> = {};
      const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
      allFields.forEach(field => {
        const fieldNorm = field.key.replace(/_/g, ' ').toLowerCase();
        const match = columns.find(c => {
          const colNorm = c.replace(/_/g, ' ').toLowerCase();
          return colNorm.includes(fieldNorm) || fieldNorm.includes(colNorm);
        });
        if (match) mapping[field.key] = match;
      });

      dispatch({ type: 'SET_PARSED_COLUMNS', payload: columns });
      dispatch({ type: 'SET_MAPPING', payload: mapping });
      dispatch({ type: 'SET_ERRORS', payload: errors });
      dispatch({ type: 'SET_RAW_ROWS', payload: rawRows });
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleMappingChange = (fieldKey: string, value: string) => {
    dispatch({
      type: 'SET_MAPPING',
      payload: { ...state.columnMapping, [fieldKey]: value },
    });
  };

  const isMappingComplete = REQUIRED_FIELDS.every(f => state.columnMapping[f.key]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel: Upload */}
        <div className="flex flex-col gap-4">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-200
              ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            
            {state.file ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <p className="font-bold text-gray-900 dark:text-white mb-1">{state.file.name}</p>
                <p className="text-sm text-gray-500">{(state.file.size / 1024).toFixed(1)} KB</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} />
                </div>
                <p className="font-bold text-gray-900 dark:text-white mb-2">Drop your CSV or XLSX here</p>
                <p className="text-sm text-gray-500 mb-6">Max 10MB — CSV, XLSX supported</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  or Browse files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Mapping */}
        <div className={`flex flex-col gap-6 transition-opacity duration-300 ${state.file ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Map your columns
              <div className="group relative cursor-help">
                <span className="text-gray-400 text-xs font-normal border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">?</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-normal">
                  Match columns from your file to the required fields. We auto-detect columns with similar names.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </h3>
          </div>

          <div className="space-y-3">
            {REQUIRED_FIELDS.map((field) => {
              const mappedColumn = state.columnMapping[field.key];
              const isAutoDetected = mappedColumn && !isParsing; // Simplified logic

              return (
                <div key={field.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">{field.label}</span>
                  
                  <div className="flex-1 flex justify-end">
                    {mappedColumn ? (
                      <div className="flex items-center gap-2">
                         <div className="relative">
                            <select
                                value={mappedColumn}
                                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-md py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer"
                            >
                                {state.parsedColumns?.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                         </div>
                         <span className="text-emerald-600 text-xs font-medium flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                            <CheckCircle2 size={12} /> Auto
                         </span>
                      </div>
                    ) : (
                      <div className="relative w-full max-w-[180px]">
                         <select
                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                            value=""
                            className="w-full appearance-none bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 text-gray-900 dark:text-white text-sm rounded-md py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none cursor-pointer"
                        >
                            <option value="" disabled>Select column...</option>
                            {state.parsedColumns?.map(col => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                            <AlertTriangle size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Errors Section */}
          {state.parseErrors.length > 0 && (
            <div className="mt-auto border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Import Issues
                </h4>
                <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-xs font-bold px-2 py-1 rounded-full">
                  {state.parseErrors.length} rows skipped
                </span>
              </div>
              <div className="max-h-24 overflow-y-auto pr-2 space-y-1">
                {state.parseErrors.map((err, idx) => (
                  <div key={idx} className="text-xs text-rose-600/80 dark:text-rose-400/80">
                    <span className="font-medium">Row {err.row}</span> — {err.field}: {err.issue}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          disabled={!state.file || !isMappingComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};
