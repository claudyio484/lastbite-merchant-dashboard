import { ImportState, ImportPreview, ImportPreviewItem, ParseError } from '../types/import.types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function apiFetchJson<T = any>(path: string, body: any): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(data.message || `API error ${res.status}`);
  }

  return res.json();
}

/**
 * Upload and parse a CSV/XLSX file via the backend.
 * POST /api/v1/products/import/parse  (multipart/form-data)
 *
 * Returns columns, errors, and ALL raw rows (stored in wizard state
 * for subsequent /validate and /confirm calls which expect JSON body).
 */
export const parseFile = async (
  file: File
): Promise<{ columns: string[]; errors: ParseError[]; rawRows: Record<string, string>[] }> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/v1/products/import/parse`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Parse failed: ${res.status}`);
  }

  const data = await res.json();

  // Backend returns: { success, data: { columns, rows, preview_rows, total_rows } }
  const errors: ParseError[] = (data.data?.errors || []).map((e: any) => ({
    row: e.row ?? 0,
    field: e.field ?? '',
    issue: e.message ?? e.issue ?? '',
  }));

  return {
    columns: data.data?.columns || [],
    errors,
    rawRows: data.data?.rows || [],
  };
};

/**
 * Run the full pipeline preview without writing to DB.
 * POST /api/v1/products/import/validate  (JSON body with raw_rows)
 */
export const generatePreview = async (state: ImportState): Promise<ImportPreview> => {
  if (!state.rawRows || state.rawRows.length === 0) {
    throw new Error('No parsed data available. Please upload a file first.');
  }

  const data = await apiFetchJson<{ success: boolean; data: any }>(
    '/v1/products/import/validate',
    {
      column_mapping: state.columnMapping,
      window_days: state.windowDays,
      include_expired: state.includeExpired,
      discount_rules: state.discountRules.map(r => ({
        days_lte: r.days,
        discount_pct: r.discount,
      })),
      round_prices: state.roundPrices,
      raw_rows: state.rawRows,
    }
  );

  const preview = data.data || {};

  // Map backend preview to frontend ImportPreview shape
  const items: ImportPreviewItem[] = (preview.previews || preview.items || []).map(
    (item: any, idx: number) => ({
      id: item.id || `row-${idx}`,
      name: item.product_name || item.name || '',
      sku: item.sku || '',
      expiryDate: item.expiry_date || item.expiryDate || '',
      daysLeft: item.days_to_expiry ?? item.daysLeft ?? 0,
      quantity: item.quantity ?? 0,
      originalPrice: Number(item.original_price ?? item.originalPrice ?? 0),
      discount: item.discount_pct ?? item.discount ?? 0,
      finalPrice: Number(item.final_price ?? item.finalPrice ?? 0),
      status: item.status === 'expired' ? 'expired' : item.status === 'ignored' ? 'ignored' : 'active',
    })
  );

  const activeItems = items.filter(i => i.status === 'active');

  return {
    totalRows: preview.original_total ?? preview.totalRows ?? items.length,
    nearExpiryRetained: preview.retained_count ?? preview.nearExpiryRetained ?? activeItems.length,
    alreadyExpired:
      preview.expired_count ?? preview.alreadyExpired ?? items.filter(i => i.status === 'expired').length,
    ignored: preview.skipped_count ?? preview.ignored ?? items.filter(i => i.status === 'ignored').length,
    items: activeItems,
    totalRetail: activeItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
    totalFinal: activeItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),
    dealCount: activeItems.length,
  };
};

/**
 * Confirm the import — create deals in the database.
 * POST /api/v1/products/import/confirm  (JSON body with raw_rows)
 */
export const confirmImport = async (state: ImportState): Promise<void> => {
  if (!state.rawRows || state.rawRows.length === 0) {
    throw new Error('No parsed data available.');
  }

  await apiFetchJson('/v1/products/import/confirm', {
    column_mapping: state.columnMapping,
    window_days: state.windowDays,
    include_expired: state.includeExpired,
    discount_rules: state.discountRules.map(r => ({
      days_lte: r.days,
      discount_pct: r.discount,
    })),
    round_prices: state.roundPrices,
    publish: state.publishMode === 'publish',
    raw_rows: state.rawRows,
  });
};
