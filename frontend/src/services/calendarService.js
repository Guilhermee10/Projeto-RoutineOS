import api from './api';

async function getWeekly(date) {
  const { data } = await api.get('/calendar/weekly', { params: date ? { date } : {} });
  return data;
}

export default { getWeekly };
