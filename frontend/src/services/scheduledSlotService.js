import api from './api';

async function list(status) {
  const { data } = await api.get('/scheduled-slots', { params: status ? { status } : {} });
  return data;
}

async function confirm(id) {
  const { data } = await api.patch(`/scheduled-slots/${id}/confirm`);
  return data;
}

async function reject(id) {
  await api.delete(`/scheduled-slots/${id}`);
}

export default { list, confirm, reject };
