import { useEffect, useState } from 'react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CHIP_BY_TONE = { success: 'chip--success', warning: 'chip--warning', danger: 'chip--danger', neutral: '' };

// Índice 0-100 em anel + uma barra por indicador. Indicador sem dado
// (null) aparece como "—" e não entra na média (ver utils/routine.js).
function RoutineScore({ result }) {
  const { score, metrics, label, tone } = result;
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  // anima o anel do vazio até o valor
  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(CIRCUMFERENCE * (1 - (score ?? 0) / 100)));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const hasEmptyMetric = metrics.some((m) => m.value === null);

  return (
    <Card title="Como está sua rotina">
      <div className="score-top">
        <div className="score-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="score-ring-track" cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9" />
            <circle
              className="score-ring-fill"
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="9"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="score-ring-center">
            <span className="score-number">{score ?? '—'}</span>
            <span className="score-max">/ 100</span>
          </div>
        </div>

        <div className="score-verdict">
          <span className={`chip ${CHIP_BY_TONE[tone]}`.trim()}>{label}</span>
          <p>Média dos indicadores desta semana.</p>
        </div>
      </div>

      <div className="metric-list">
        {metrics.map((metric) => (
          <div className={`metric-row${metric.value === null ? ' is-empty' : ''}`} key={metric.key}>
            <span className="metric-label">{metric.label}</span>
            <ProgressBar value={metric.value} size="sm" label={metric.label} />
            <span className="metric-value">{metric.value === null ? '—' : `${metric.value}%`}</span>
          </div>
        ))}
      </div>

      {hasEmptyMetric && <p className="score-note">“—” = ainda sem dado; não entra na média.</p>}
    </Card>
  );
}

export default RoutineScore;
