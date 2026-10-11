import api, { saveSession } from './api';

async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  saveSession(data);
  return data.user;
}

async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  saveSession(data);
  return data.user;
}

// Logout "de verdade" agora: avisa o backend pra revogar o refresh
// token (best-effort - se a chamada falhar, não impede o logout local;
// o usuário saiu da tela de qualquer forma, só o token ficaria válido
// no banco até expirar sozinho).
async function logout() {
  const refreshToken = localStorage.getItem('routineos_refresh_token');
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  } catch {
    // Ignorado de propósito - ver comentário acima.
  }
  localStorage.removeItem('routineos_access_token');
  localStorage.removeItem('routineos_refresh_token');
  localStorage.removeItem('routineos_user');
}

function getStoredUser() {
  const raw = localStorage.getItem('routineos_user');
  return raw ? JSON.parse(raw) : null;
}

export default { login, register, logout, getStoredUser };
