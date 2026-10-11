import api from './api';

async function list() {
  const { data } = await api.get('/workouts');
  return data;
}

async function getStats() {
  const { data } = await api.get('/workouts/stats');
  return data;
}

async function create(record) {
  const { data } = await api.post('/workouts', record);
  return data;
}

async function update(id, record) {
  const { data } = await api.put(`/workouts/${id}`, record);
  return data;
}

async function remove(id) {
  await api.delete(`/workouts/${id}`);
}

export default { list, getStats, create, update, remove };
