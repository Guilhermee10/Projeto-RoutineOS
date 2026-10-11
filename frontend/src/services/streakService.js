import api from './api';

async function get() {
  const { data } = await api.get('/streaks');
  return data;
}

export default { get };
