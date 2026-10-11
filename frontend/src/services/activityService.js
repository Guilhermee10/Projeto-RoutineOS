import api from './api';

async function list() {
  const { data } = await api.get('/activities');
  return data;
}

async function create(activity) {
  const { data } = await api.post('/activities', activity);
  return data;
}

async function update(id, activity) {
  const { data } = await api.put(`/activities/${id}`, activity);
  return data;
}

async function remove(id) {
  await api.delete(`/activities/${id}`);
}

async function checkin(id, date, completed) {
  const { data } = await api.patch(`/activities/${id}/checkin`, { date, completed });
  return data;
}

async function listCheckIns(from, to) {
  const { data } = await api.get('/activities/checkins', { params: { from, to } });
  return data;
}

export default { list, create, update, remove, checkin, listCheckIns };
