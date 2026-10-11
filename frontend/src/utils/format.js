export function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

export const CATEGORY_LABELS = {
  TRABALHO: 'Trabalho',
  ESTUDO: 'Estudo',
  FACULDADE: 'Faculdade',
  TREINO: 'Treino',
  TRANSPORTE: 'Transporte',
  SONO: 'Sono',
  ALIMENTACAO: 'Alimentação',
  LAZER: 'Lazer',
  COMPROMISSO: 'Compromisso',
  OUTROS: 'Outros',
};

// "Hoje" = o dia do calendário LOCAL do usuário, no formato AAAA-MM-DD
// (é o que o backend também usa em getToday()). Antes isso usava
// toISOString() (UTC): no Brasil, depois das 21h o "hoje" virava amanhã
// e check-ins/metas do dia apareciam errados à noite.
export function getTodayDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// Devolve as 7 datas (strings "AAAA-MM-DD") de uma semana, segunda a
// domingo. weekOffset=0 é a semana atual, -1 a anterior, 1 a próxima.
// Mesma convenção UTC usada no backend (ver dateUtils.js lá), pra uma
// data marcada aqui bater exatamente com o que o servidor entende
// como "o mesmo dia".
export function getWeekDates(weekOffset = 0) {
  const today = new Date(`${getTodayDateString()}T00:00:00Z`);
  const diffToMonday = (today.getUTCDay() + 6) % 7; // 0 = domingo
  const monday = new Date(today);
  monday.setUTCDate(monday.getUTCDate() - diffToMonday + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    return date.toISOString().slice(0, 10);
  });
}

export function toDateInputValue(isoDate) {
  return isoDate ? isoDate.slice(0, 10) : '';
}

export function formatDateDisplay(isoDate) {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export const GOAL_TYPE_LABELS = {
  ESTUDO_HORAS: 'Horas de estudo',
  TREINO_QUANTIDADE: 'Quantidade de treinos',
  SONO_HORAS: 'Horas de sono',
  PERSONALIZADA: 'Personalizada (progresso manual)',
};

export const GOAL_PERIOD_LABELS = {
  SEMANAL: 'Semanal',
  MENSAL: 'Mensal',
};

export const PRIORITY_LABELS = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
};

// Mesma convenção do backend: 0 = domingo ... 6 = sábado
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

// Paleta restrita: 4 tons (índigo, azul, violeta, cinza) em vez de uma
// cor diferente por categoria - mantém o visual calmo e as cores
// "com significado" (verde/amarelo/vermelho) reservadas pra status.
export const CATEGORY_COLORS = {
  TRABALHO: '#7c83ff',
  ESTUDO: '#58a6ff',
  FACULDADE: '#58a6ff',
  TREINO: '#a78bfa',
  TRANSPORTE: '#8b93a7',
  SONO: '#7c83ff',
  ALIMENTACAO: '#8b93a7',
  LAZER: '#a78bfa',
  COMPROMISSO: '#58a6ff',
  OUTROS: '#8b93a7',
};

export const CATEGORY_ICONS = {
  TRABALHO: '💼',
  ESTUDO: '📚',
  FACULDADE: '🎓',
  TREINO: '🏋️',
  TRANSPORTE: '🚌',
  SONO: '😴',
  ALIMENTACAO: '🍽️',
  LAZER: '🎮',
  COMPROMISSO: '📌',
  OUTROS: '•',
};

// Versão "de cartão" da duração: "7h 42min", "2h", "50min".
export function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, '0')}min`;
}

// Soma dias a uma data "AAAA-MM-DD" (convenção UTC do projeto).
export function addDaysToDateString(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
