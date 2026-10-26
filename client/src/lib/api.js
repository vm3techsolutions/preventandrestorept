// Centralized REST client for the Express API. All browser <-> server communication goes through here.
// Absolute (http://localhost:5000/api) or same-origin relative (/api) base URL.
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
// Server-only override so SSR can reach the API directly when the public base is relative (/api).
const SERVER_BASE = (process.env.API_INTERNAL_URL || '').replace(/\/$/, '');
const base = () => (typeof window === 'undefined' && SERVER_BASE ? SERVER_BASE : BASE);
const API_ORIGIN = /^https?:\/\//i.test(BASE) ? new URL(BASE).origin : '';
const origin = () => (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, query, form, revalidate } = {}) {
  const url = new URL(`${base()}${path}`, origin());
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      ...(revalidate !== undefined ? { next: { revalidate } } : { cache: 'no-store' }),
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: form || (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new ApiError(data?.error?.message || `Request failed (${res.status})`, res.status, data?.error?.details);
  }
  return data;
}

const content = (resource) => ({
  list: (query) => request(`/admin/${resource}`, { query }),
  get: (id) => request(`/admin/${resource}/${id}`),
  create: (body) => request(`/admin/${resource}`, { method: 'POST', body }),
  update: (id, body) => request(`/admin/${resource}/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/admin/${resource}/${id}`, { method: 'DELETE' }),
  restore: (id) => request(`/admin/${resource}/${id}/restore`, { method: 'POST' }),
  publish: (id) => request(`/admin/${resource}/${id}/publish`, { method: 'POST' }),
  unpublish: (id) => request(`/admin/${resource}/${id}/unpublish`, { method: 'POST' }),
  archive: (id) => request(`/admin/${resource}/${id}/archive`, { method: 'POST' }),
  reorder: (ids) => request(`/admin/${resource}/reorder`, { method: 'PUT', body: { ids } }),
  preview: (id) => request(`/admin/${resource}/${id}/preview`),
});

const crud = (resource) => ({
  list: (query) => request(`/admin/${resource}`, { query }),
  create: (body) => request(`/admin/${resource}`, { method: 'POST', body }),
  update: (id, body) => request(`/admin/${resource}/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/admin/${resource}/${id}`, { method: 'DELETE' }),
});

const PUBLIC_TTL = 60;
const pub = (path, query) => request(path, { query, revalidate: PUBLIC_TTL });
const publicContent = (resource) => ({
  list: (query) => pub(`/public/${resource}`, query),
  get: (slug) => pub(`/public/${resource}/${encodeURIComponent(slug)}`),
});

export const api = {
  auth: {
    setupStatus: () => request('/auth/setup/status'),
    setup: (body) => request('/auth/setup', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    changePassword: (body) => request('/auth/password', { method: 'PUT', body }),
  },
  dashboard: { get: () => request('/admin/dashboard') },
  content,
  categories: crud('categories'),
  tags: crud('tags'),
  authors: crud('authors'),
  redirects: crud('redirects'),
  reviews: crud('reviews'),
  admins: {
    list: (query) => request('/admin/admins', { query }),
    create: (body) => request('/admin/admins', { method: 'POST', body }),
    setStatus: (id, isActive) => request(`/admin/admins/${id}/status`, { method: 'PUT', body: { isActive } }),
    resetPassword: (id, newPassword) => request(`/admin/admins/${id}/password`, { method: 'PUT', body: { newPassword } }),
  },
  activity: { list: (query) => request('/admin/activity', { query }) },
  media: {
    status: () => request('/admin/media/status'),
    list: (query) => request('/admin/media', { query }),
    remove: (id) => request(`/admin/media/${id}`, { method: 'DELETE' }),
    upload: (file, folder, extra = {}) => {
      const form = new FormData();
      form.append('folder', folder);
      Object.entries(extra).forEach(([k, v]) => v && form.append(k, v));
      form.append('file', file);
      return request('/admin/media', { method: 'POST', form });
    },
  },
  settings: {
    get: () => request('/admin/settings'),
    update: (body) => request('/admin/settings', { method: 'PUT', body }),
  },
  public: {
    blogs: { ...publicContent('blogs'), categories: () => pub('/public/blogs/categories'), tags: () => pub('/public/blogs/tags') },
    services: publicContent('services'),
    conditions: publicContent('conditions'),
    pages: publicContent('pages'),
    resolveRedirect: (path) => request('/public/redirects/resolve', { query: { path } }),
    redirects: (query) => request('/public/redirects', { query }),
    sitemap: () => pub('/public/sitemap'),
    settings: () => pub('/public/settings'),
    reviews: (query) => pub('/public/reviews', query),
  },
};

export const mediaUrl = (u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `${API_ORIGIN}${u}`);
