const API_BASE = import.meta.env.VITE_API_URL || '/api';

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      window.location.hash = '#/login';
      return null;
    }
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    clearTokens();
    window.location.hash = '#/login';
    return null;
  }
}

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401, try refreshing the token once
  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `API error ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────
export async function loginApi(email: string, password: string) {
  const data = await apiFetch<{
    success: boolean;
    accessToken: string;
    refreshToken: string;
    user: any;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function registerApi(body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  storeName: string;
  storeSlug?: string;
}) {
  const data = await apiFetch<{
    success: boolean;
    accessToken: string;
    refreshToken: string;
    user: any;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  setTokens(data.accessToken, data.refreshToken);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function logoutApi() {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // ignore
  }
  clearTokens();
}

export async function getMe() {
  return apiFetch<{ success: boolean; user: any }>('/auth/me');
}

// ─── Password Reset ─────────────────────────────────────
export async function forgotPasswordApi(email: string) {
  return apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordApi(token: string, password: string) {
  return apiFetch<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

// ─── Email OTP ──────────────────────────────────────────
export async function sendEmailOtpApi(email: string) {
  return apiFetch<{ success: boolean; message: string; code?: string }>('/auth/send-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailOtpApi(email: string, code: string) {
  return apiFetch<{ success: boolean; message: string }>('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

// ─── Users (Team Members) ────────────────────────────────
export async function fetchUsers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<{ success: boolean; data: any[] }>(`/users${qs}`);
}

export async function fetchUserById(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/users/${id}`);
}

export async function createUserApi(body: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  jobTitle?: string;
}) {
  return apiFetch<{ success: boolean; data: any; tempPassword?: string }>('/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateUserApi(id: string, body: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  jobTitle?: string;
  isActive?: boolean;
}) {
  return apiFetch<{ success: boolean; data: any }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteUserApi(id: string) {
  return apiFetch<{ success: boolean; message: string }>(`/users/${id}`, {
    method: 'DELETE',
  });
}

// ─── Dashboard ───────────────────────────────────────────
export async function getDashboardStats() {
  return apiFetch<{ success: boolean; data: any }>('/dashboard/stats');
}

export async function getActionNeeded() {
  return apiFetch<{ success: boolean; data: any }>('/dashboard/action-needed');
}

// ─── Products ────────────────────────────────────────────
export async function fetchProducts() {
  return apiFetch<{ success: boolean; data: any[] }>('/products?limit=500');
}

export async function fetchProductById(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/products/${id}`);
}

export async function createProduct(body: any) {
  return apiFetch<{ success: boolean; data: any }>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateProduct(id: string, body: any) {
  return apiFetch<{ success: boolean; data: any }>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteProductApi(id: string) {
  return apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' });
}

export async function toggleFeaturedApi(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/products/${id}/toggle-featured`, {
    method: 'PATCH',
  });
}

// ─── Categories ──────────────────────────────────────────
export async function fetchCategories() {
  return apiFetch<{ success: boolean; data: any[] }>('/categories');
}

// ─── Orders ──────────────────────────────────────────────
export async function fetchOrders() {
  return apiFetch<{ success: boolean; data: any[] }>('/orders');
}

export async function fetchOrderById(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string) {
  return apiFetch<{ success: boolean; data: any }>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Messages ────────────────────────────────────────────
export async function fetchConversations() {
  return apiFetch<{ success: boolean; data: any[] }>('/messages/conversations');
}

export async function fetchMessages(conversationId: string) {
  return apiFetch<{ success: boolean; data: any[] }>(`/messages/conversations/${conversationId}`);
}

export async function sendMessage(conversationId: string, body: string) {
  return apiFetch<{ success: boolean; data: any }>(`/messages/conversations/${conversationId}/send`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function fetchUnreadCount() {
  return apiFetch<{ success: boolean; data: { count: number } }>('/messages/unread-count');
}

// ─── Notifications ───────────────────────────────────────
export async function fetchNotifications() {
  return apiFetch<{ success: boolean; data: any[] }>('/notifications');
}

export async function fetchNotificationPreview() {
  return apiFetch<{ success: boolean; data: any[] }>('/notifications/preview');
}

export async function markAllNotificationsRead() {
  return apiFetch<{ success: boolean }>('/notifications/mark-all-read', { method: 'POST' });
}

// ─── Analytics ───────────────────────────────────────────
export async function fetchAnalyticsOverview(period = '7d') {
  return apiFetch<{ success: boolean; data: any }>(`/analytics/overview?period=${period}`);
}

// ─── Settings ────────────────────────────────────────────
export async function fetchProfile() {
  return apiFetch<{ success: boolean; data: any }>('/settings/profile');
}

export async function updateProfile(body: any) {
  return apiFetch<{ success: boolean; data: any }>('/settings/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function fetchStoreSettings() {
  return apiFetch<{ success: boolean; data: any }>('/settings/store');
}

export async function updateStoreSettings(body: any) {
  return apiFetch<{ success: boolean; data: any }>('/settings/store', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function updateNotificationSettings(body: any) {
  return apiFetch<{ success: boolean }>('/settings/notifications', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function fetchBilling() {
  return apiFetch<{ success: boolean; data: any }>('/settings/billing');
}
