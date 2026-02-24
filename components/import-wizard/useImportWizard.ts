import { useReducer } from 'react';
import { ImportState, ImportAction, DiscountRule } from '../../types/import.types';

const initialState: ImportState = {
  currentStep: 1,
  file: null,
  parsedColumns: [],
  columnMapping: {},
  parseErrors: [],
  rawRows: [],
  windowDays: 7,
  includeExpired: false,
  discountRules: [
    { id: '1', days: 2, discount: 50 },
    { id: '2', days: 5, discount: 30 },
    { id: '3', days: 10, discount: 15 },
  ],
  roundPrices: false,
  preview: null,
  publishMode: 'publish',
  status: 'idle',
};

function reducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, file: action.payload };
    case 'SET_PARSED_COLUMNS':
      return { ...state, parsedColumns: action.payload };
    case 'SET_MAPPING':
      return { ...state, columnMapping: action.payload };
    case 'SET_ERRORS':
      return { ...state, parseErrors: action.payload };
    case 'SET_RAW_ROWS':
      return { ...state, rawRows: action.payload };
    case 'SET_WINDOW_DAYS':
      return { ...state, windowDays: action.payload };
    case 'TOGGLE_INCLUDE_EXPIRED':
      return { ...state, includeExpired: !state.includeExpired };
    case 'ADD_RULE':
      return { ...state, discountRules: [...state.discountRules, action.payload] };
    case 'UPDATE_RULE':
      return {
        ...state,
        discountRules: state.discountRules.map(rule =>
          rule.id === action.payload.id
            ? { ...rule, [action.payload.field]: action.payload.value }
            : rule
        ),
      };
    case 'DELETE_RULE':
      return {
        ...state,
        discountRules: state.discountRules.filter(rule => rule.id !== action.payload),
      };
    case 'TOGGLE_ROUND_PRICES':
      return { ...state, roundPrices: !state.roundPrices };
    case 'SET_PREVIEW':
      return { ...state, preview: action.payload };
    case 'SET_PUBLISH_MODE':
      return { ...state, publishMode: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4) as any };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) as any };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const useImportWizard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
};
