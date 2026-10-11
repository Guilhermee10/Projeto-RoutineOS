import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS, formatDuration } from '../../utils/format';

const MINUTES_IN_DAY = 24 * 60;

// "Onde o tempo está indo": uma barra geral do dia (o que sobra da barra
// é tempo não planejado) + uma linha por categoria, da maior pra menor.
function TimeDistribution({ totals, title = 'Distribuição do dia' }) {
  const entries = Object.entries(totals)
    .map(([category, minutes]) => ({ category, minutes }))
    .filter((entry) => entry.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const planned = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const largest = entries[0]?.minutes || 1;

  return (
    <Card title={title} subtitle={planned > 0 ? `${formatDuration(planned)} planejados de 24h` : undefined}>
      {entries.length === 0 ? (
        <p className="empty-state">Nada planejado para este dia ainda.</p>
      ) : (
        <>
          <div className="dist-stack" aria-hidden="true">
            {entries.map((entry) => (
              <span
                key={entry.category}
                className="dist-seg"
                style={{
                  width: `${(entry.minutes / MINUTES_IN_DAY) * 100}%`,
                  background: CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.OUTROS,
                }}
              />
            ))}
          </div>

          {entries.map((entry) => (
            <div
              className="dist-row"
              key={entry.category}
              style={{ '--dist-color': CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.OUTROS }}
            >
              <span className="dist-icon" aria-hidden="true">{CATEGORY_ICONS[entry.category]}</span>
              <span className="dist-label">{CATEGORY_LABELS[entry.category] || entry.category}</span>
              <ProgressBar
                value={(entry.minutes / largest) * 100}
                label={CATEGORY_LABELS[entry.category] || entry.category}
              />
              <span className="dist-time">{formatDuration(entry.minutes)}</span>
              <span className="dist-pct">{Math.round((entry.minutes / MINUTES_IN_DAY) * 100)}%</span>
            </div>
          ))}

          <p className="dist-legend">A parte vazia da barra é tempo ainda não planejado.</p>
        </>
      )}
    </Card>
  );
}

export default TimeDistribution;
