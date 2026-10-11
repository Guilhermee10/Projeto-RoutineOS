import api from './api';

async function list() {
  const { data } = await api.get('/goals');
  return data;
}

async function create(goal) {
  const { data } = await api.post('/goals', goal);
  return data;
}

async function update(id, goal) {
  const { data } = await api.put(`/goals/${id}`, goal);
  return data;
}

async function remove(id) {
  await api.delete(`/goals/${id}`);
}

async function registerProgress(id, increment) {
  const { data } = await api.patch(`/goals/${id}/progress`, { increment });
  return data;
}

async function checkin(id, date, completed) {
  const { data } = await api.patch(`/goals/${id}/checkin`, { date, completed });
  return data;
}

async function resetProgress(id) {
  const { data } = await api.patch(`/goals/${id}/reset`);
  return data;
}

export default { list, create, update, remove, registerProgress, checkin, resetProgress };
