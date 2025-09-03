import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') + '/api',
  withCredentials: true,
});

const tokenKey = 'accessToken';

export const setAccessToken = (token?: string | null) => {
  if (token) {
    localStorage.setItem(tokenKey, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(tokenKey);
    delete api.defaults.headers.common['Authorization'];
  }
};

export const initAuthHeaderFromStorage = () => {
  const t = localStorage.getItem(tokenKey);
  if (t) api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
};

initAuthHeaderFromStorage();

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) setAccessToken(null);
    return Promise.reject(err);
  }
);

export default api;