import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import ProgressBar from '../ui/ProgressBar';
import { CATEGORY_ICONS } from '../../utils/format';

const SHORT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function shortDay(dateStr) {
  return SHORT_DAYS[new Date(`${dateStr}T00:00:00Z`).getUTCDay()];
}

// Rastreador de hábitos da semana. Estados da célula:
//  ✓ feito  ·  ○ pendente (clicável)  ·  — não planejado nesse dia.
// Só desenha: o estado vem de useHabitWeek (fonte única).
function HabitTracker({
  stats,
  weekDates,
  todayStr,
  onToggle,
  pendingKey,
  loading = false,
  error = '',
  navigation = null,
  action = null,
}) {
  const percent = stats.total.percent;

  return (
    <Card
      title="Hábitos da semana"
      subtitle="Marque o que você já fez"
      action={
        navigation ? (
          <div className="habit-nav">
            <button type="button" className="btn-ghost" onClick={navigation.onPrev} aria-label="Semana anterior">
              <Icon name="chevronLeft" size={16} />
            </button>
            <span className="habit-range">{navigation.label}</span>
            <button type="button" className="btn-ghost" onClick={navigation.onNext} aria-label="Próxima semana">
              <Icon name="chevronRight" size={16} />
            </button>
            {navigation.onToday && (
              <button type="button" className="btn-ghost" onClick={navigation.onToday}>Hoje</button>
            )}
          </div>
        ) : (
          action
        )
      }
    >
      {error && <p className="alert-error">{error}</p>}

      {loading ? (
        <p className="muted">Carregando hábitos...</p>
      ) : stats.rows.length === 0 ? (
        <p className="empty-state">
          Você ainda não tem atividades. Crie a primeira em <Link to="/activities">Atividades</Link>.
        </p>
      ) : (
        <>
          <div className="habit-summary">
            <span className="habit-percent">{percent === null ? '—' : `${percent}%`}</span>
            <span className="habit-percent-label">concluído</span>
          </div>
          <div className="habit-progress">
            <ProgressBar value={percent} tone={percent !== null && percent >= 75 ? 'success' : 'accent'} label="Hábitos concluídos" />
          </div>

          <div className="habit-scroll">
            <div className="habit-table">
              <div className="habit-row habit-row--head">
                <span />
                {weekDates.map((date) => (
                  <span key={date} className={`habit-day${date === todayStr ? ' is-today' : ''}`}>
                    {shortDay(date)}
                    <small>{date.slice(8, 10)}</small>
                  </span>
                ))}
              </div>

              {stats.rows.map(({ activity, cells, planned, done }) => (
                <div className="habit-row" key={activity.id}>
                  <span className="habit-name">
                    <span aria-hidden="true">{CATEGORY_ICONS[activity.category]}</span>
                    <span className="habit-name-text">{activity.name}</span>
                    {planned > 0 && <span className="habit-fraction">{done}/{planned}</span>}
                  </span>

                  {cells.map((cell) => {
                    const key = `${activity.id}|${cell.date}`;
                    return (
                      <span className="habit-cell-wrap" key={cell.date}>
                        {cell.state === 'none' ? (
                          <span className="habit-none" aria-label="Não planejado">—</span>
                        ) : (
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={cell.state === 'done'}
                            aria-label={`${activity.name}, ${shortDay(cell.date)} ${cell.date.slice(8, 10)}`}
                            className={`btn-reset habit-cell${cell.isToday ? ' is-today' : ''}${cell.isFuture ? ' is-future' : ''}`}
                            disabled={pendingKey === key}
                            onClick={() => onToggle(activity.id, cell.date)}
                          >
                            <Icon name="check" strokeWidth={3} />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

export default HabitTracker;
