import api from './api';

async function analyze() {
  const { data } = await api.post('/optimization/analyze');
  return data;
}

export default { analyze };
