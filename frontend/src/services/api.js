import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const api = axios.create({ baseURL });

// Instância separada, SEM interceptors, usada só pra chamar
// /auth/refresh. Se o `api` normal fizesse essa chamada, uma falha no
// refresh disparia o próprio interceptor de resposta dele e criaria
// um loop.
const refreshClient = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('routineos_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function saveSession({ accessToken, refreshToken, user }) {
  localStorage.setItem('routineos_access_token', accessToken);
  localStorage.setItem('routineos_refresh_token', refreshToken);
  if (user) localStorage.setItem('routineos_user', JSON.stringify(user));
}

function clearSessionAndRedirect() {
  localStorage.removeItem('routineos_access_token');
  localStorage.removeItem('routineos_refresh_token');
  localStorage.removeItem('routineos_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Se várias requisições derem 401 ao mesmo tempo (ex: a tela faz 3
// chamadas em paralelo e o access token expirou), não queremos
// disparar 3 refreshes simultâneos - a primeira "segura a fila" e as
// outras esperam o mesmo resultado.
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('routineos_refresh_token');
  if (!refreshToken) throw new Error('Sem refresh token salvo.');

  const { data } = await refreshClient.post('/auth/refresh', { refreshToken });
  saveSession(data);
  return data.accessToken;
}

// Interceptor de resposta: se deu 401 numa rota protegida comum (não
// no próprio login/registro/refresh), tenta renovar o access token
// UMA vez e refaz a requisição original. Só desloga de verdade se o
// refresh também falhar (refresh token expirado ou revogado).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response?.status === 401;
    const isAuthEndpoint = /\/auth\/(login|register|refresh)$/.test(originalRequest?.url || '');

    if (is401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true; // evita loop infinito de retry
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { saveSession, clearSessionAndRedirect };
