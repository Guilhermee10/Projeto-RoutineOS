import api from './api';

async function list() {
  const { data } = await api.get('/notifications');
  return data;
}

export default { list };
