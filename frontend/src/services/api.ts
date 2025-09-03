import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.defaults.xsrfCookieName = 'XSRF-TOKEN';
api.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

(api.defaults as any).withXSRFToken = true;

const tokenKey = 'accessToken';

export const setAccessToken = (token?: string | null) => {
  if (token) {
    localStorage.setItem(tokenKey, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(tokenKey);
    delete api.defaults.headers.common.Authorization;
  }
};

export const initAuthHeaderFromStorage = () => {
  const t = localStorage.getItem(tokenKey);
  if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;
};
initAuthHeaderFromStorage();

export const getCsrfCookie = () =>
  api.get('/sanctum/csrf-cookie', { baseURL: API_BASE_URL, withCredentials: true });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) setAccessToken(null);
    return Promise.reject(err);
  }
);

export default api;