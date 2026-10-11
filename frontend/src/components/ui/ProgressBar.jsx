import { useEffect, useState } from 'react';

// Barra de progresso que ANIMA do zero até o valor ao aparecer (e a cada
// mudança). value === null desenha a barra vazia (sem dado).
function ProgressBar({ value, tone = 'accent', size = 'md', label }) {
  const target = value == null ? 0 : Math.max(0, Math.min(100, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div
      className={`progress progress--${size}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(target)}
      aria-label={label}
    >
      <div className={`progress-fill progress-fill--${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default ProgressBar;
