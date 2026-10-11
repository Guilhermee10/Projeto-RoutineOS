import api from './api';

async function list(params = {}) {
  const { data } = await api.get('/notes', { params });
  return data;
}

async function listTags() {
  const { data } = await api.get('/notes/tags');
  return data;
}

async function create(note) {
  const { data } = await api.post('/notes', note);
  return data;
}

// Só os campos que a API aceita - nunca o objeto inteiro recebido (mesma
// lição do bug de edição das atividades).
async function update(id, patch) {
  const { data } = await api.put(`/notes/${id}`, patch);
  return data;
}

async function remove(id) {
  await api.delete(`/notes/${id}`);
}

export default { list, listTags, create, update, remove };
