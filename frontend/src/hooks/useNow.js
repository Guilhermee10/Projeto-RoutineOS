import { useEffect, useState } from 'react';

// Relógio que se atualiza sozinho (a cada 30s) - é o que faz a
// atividade "atual" da timeline mudar sem recarregar a página.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export const minutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();
