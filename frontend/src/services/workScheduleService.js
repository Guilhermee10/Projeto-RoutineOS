import api from './api';

async function list() {
  const { data } = await api.get('/work');
  return data;
}

async function getHours() {
  const { data } = await api.get('/work/hours');
  return data;
}

async function create(schedule) {
  const { data } = await api.post('/work', schedule);
  return data;
}

async function update(id, schedule) {
  const { data } = await api.put(`/work/${id}`, schedule);
  return data;
}

async function remove(id) {
  await api.delete(`/work/${id}`);
}

export default { list, getHours, create, update, remove };
