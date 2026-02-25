import { ImportState, ImportPreview, ImportPreviewItem, ParseError } from '../types/import.types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

async function tryRefreshToken(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function apiFetchJson<T = any>(path: string, body: any): Promise<T> {
  let token = getAuthToken();

  const doFetch = async (t: string | null) => {
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: JSON.stringify(body),
    });
  };

  let res = await doFetch(token);

  // If 401, try refreshing the token once
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

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

  let token = getAuthToken();

  const doFetch = async (t: string | null) => {
    return fetch(`${API_BASE}/v1/products/import/parse`, {
      method: 'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: formData,
    });
  };

  let res = await doFetch(token);

  // If 401, try refreshing the token once
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

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

  // Backend returns: { totalRows, retained, expired, skippedZeroQty, parseErrors, distribution, deals }
  // Each deal: { sku, productName, barcode, expiryDate, daysToExpiry, quantity, originalPrice, discountPct, finalPrice, warning? }
  const deals = preview.deals || preview.previews || preview.items || [];
  const items: ImportPreviewItem[] = deals.map(
    (item: any, idx: number) => ({
      id: item.id || `row-${idx}`,
      name: item.productName || item.product_name || item.name || '',
      sku: item.sku || '',
      expiryDate: item.expiryDate || item.expiry_date || '',
      daysLeft: item.daysToExpiry ?? item.days_to_expiry ?? 0,
      quantity: item.quantity ?? 0,
      originalPrice: Number(item.originalPrice ?? item.original_price ?? 0),
      discount: item.discountPct ?? item.discount_pct ?? 0,
      finalPrice: Number(item.finalPrice ?? item.final_price ?? 0),
      status: 'active' as const,
    })
  );

  return {
    totalRows: preview.totalRows ?? items.length,
    nearExpiryRetained: preview.retained ?? items.length,
    alreadyExpired: preview.expired ?? 0,
    ignored: preview.skippedZeroQty ?? 0,
    items,
    totalRetail: items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0),
    totalFinal: items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),
    dealCount: items.length,
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
