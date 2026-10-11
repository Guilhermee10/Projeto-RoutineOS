import api from './api';

async function getDaily(date) {
  const { data } = await api.get('/dashboard', { params: date ? { date } : {} });
  return data;
}

export default { getDaily };
