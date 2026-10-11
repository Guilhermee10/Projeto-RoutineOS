import api from './api';

async function list() {
  const { data } = await api.get('/studies');
  return data;
}

async function getStats() {
  const { data } = await api.get('/studies/stats');
  return data;
}

async function create(record) {
  const { data } = await api.post('/studies', record);
  return data;
}

async function update(id, record) {
  const { data } = await api.put(`/studies/${id}`, record);
  return data;
}

async function remove(id) {
  await api.delete(`/studies/${id}`);
}

export default { list, getStats, create, update, remove };
