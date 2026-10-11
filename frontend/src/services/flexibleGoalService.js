import api from './api';

async function list() {
  const { data } = await api.get('/flexible-goals');
  return data;
}

async function create(goal) {
  const { data } = await api.post('/flexible-goals', goal);
  return data;
}

async function update(id, goal) {
  const { data } = await api.put(`/flexible-goals/${id}`, goal);
  return data;
}

async function remove(id) {
  await api.delete(`/flexible-goals/${id}`);
}

export default { list, create, update, remove };
