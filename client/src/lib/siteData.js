import { api } from './api';

// Lists degrade to empty so pages still render when the API is down.
export async function listSafe(resource, query) {
  try {
    return await api.public[resource].list(query);
  } catch (e) {
    console.error(`[site] ${resource} list failed:`, e.message);
    return { data: [], pagination: { page: 1, totalPages: 1, total: 0 } };
  }
}

// Details: null on 404 (page calls notFound), other errors bubble to error.js.
export async function getDetail(resource, slug) {
  try {
    return (await api.public[resource].get(slug)).data;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '');
