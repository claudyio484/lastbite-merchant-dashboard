export type ImportStep = 1 | 2 | 3 | 4;

export interface DiscountRule {
  id: string;
  days: number;
  discount: number;
}

export interface ParseError {
  row: number;
  field: string;
  issue: string;
}

export interface ImportPreviewItem {
  id: string;
  name: string;
  sku: string;
  expiryDate: string;
  daysLeft: number;
  quantity: number;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  status: 'active' | 'expired' | 'ignored';
}

export interface ImportPreview {
  totalRows: number;
  nearExpiryRetained: number;
  alreadyExpired: number;
  ignored: number;
  items: ImportPreviewItem[];
  totalRetail: number;
  totalFinal: number;
  dealCount: number;
}

export interface ImportState {
  currentStep: ImportStep;
  file: File | null;
  parsedColumns: string[];
  columnMapping: Record<string, string>;
  parseErrors: ParseError[];
  rawRows: Record<string, string>[];
  windowDays: number;
  includeExpired: boolean;
  discountRules: DiscountRule[];
  roundPrices: boolean;
  preview: ImportPreview | null;
  publishMode: 'publish' | 'draft';
  status: 'idle' | 'loading' | 'confirming' | 'success' | 'error';
}

export type ImportAction =
  | { type: 'SET_FILE'; payload: File }
  | { type: 'SET_PARSED_COLUMNS'; payload: string[] }
  | { type: 'SET_MAPPING'; payload: Record<string, string> }
  | { type: 'SET_ERRORS'; payload: ParseError[] }
  | { type: 'SET_RAW_ROWS'; payload: Record<string, string>[] }
  | { type: 'SET_WINDOW_DAYS'; payload: number }
  | { type: 'TOGGLE_INCLUDE_EXPIRED' }
  | { type: 'ADD_RULE'; payload: DiscountRule }
  | { type: 'UPDATE_RULE'; payload: { id: string; field: keyof DiscountRule; value: number } }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'TOGGLE_ROUND_PRICES' }
  | { type: 'SET_PREVIEW'; payload: ImportPreview }
  | { type: 'SET_PUBLISH_MODE'; payload: 'publish' | 'draft' }
  | { type: 'SET_STATUS'; payload: ImportState['status'] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };
