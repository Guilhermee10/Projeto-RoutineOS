import api from './api';

async function getWeekly() {
  const { data } = await api.get('/reports/weekly');
  return data;
}

async function getAiSummary() {
  const { data } = await api.post('/reports/weekly/ai-summary');
  return data;
}

export default { getWeekly, getAiSummary };
