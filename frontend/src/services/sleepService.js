import api from './api';

// params opcional: { from: 'AAAA-MM-DD', to: 'AAAA-MM-DD' } - o backend já suporta
async function list(params) {
  const { data } = await api.get('/sleep', { params });
  return data;
}

async function getStats(params) {
  const { data } = await api.get('/sleep/stats', { params });
  return data;
}

async function create(record) {
  const { data } = await api.post('/sleep', record);
  return data;
}

async function update(id, record) {
  const { data } = await api.put(`/sleep/${id}`, record);
  return data;
}

async function remove(id) {
  await api.delete(`/sleep/${id}`);
}

export default { list, getStats, create, update, remove };
