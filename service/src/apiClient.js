import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API || '/api';
export const api = axios.create({ baseURL: API_BASE, withCredentials: true,
  headers: { 'X-Service-App': '1' }, timeout: 30000 });

function sessionExpired(error) {
  if (error.response?.status === 401) window.dispatchEvent(new Event('session-expired'));
  return Promise.reject(error);
}
api.interceptors.response.use(response => response, sessionExpired);

// Existing screens use the default Axios client with absolute API paths.
axios.interceptors.request.use(config => {
  const target = new URL(config.url, window.location.origin);
  const base = new URL(API_BASE, window.location.origin);
  if (target.origin === base.origin &&
      (target.pathname === base.pathname || target.pathname.startsWith(`${base.pathname.replace(/\/$/, '')}/`))) {
    config.withCredentials = true;
    config.headers['X-Service-App'] = '1';
  }
  return config;
});
axios.interceptors.response.use(response => response, sessionExpired);

export async function apiFetch(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: 'include',
    headers: { ...options.headers, 'X-Service-App': '1' } });
  if (response.status === 401) window.dispatchEvent(new Event('session-expired'));
  return response;
}
