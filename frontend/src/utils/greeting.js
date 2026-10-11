// Saudação e data por extenso, sempre pelo relógio do navegador do usuário.
// 05h-11h bom dia, 12h-17h boa tarde, o resto (18h-04h) boa noite -
// madrugada também é "boa noite", não "bom dia".
export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function formatLongDate(date = new Date()) {
  const text = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getFirstName(name = '') {
  return name.trim().split(/\s+/)[0] || '';
}
