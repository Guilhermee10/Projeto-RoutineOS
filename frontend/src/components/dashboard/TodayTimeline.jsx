import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import { CATEGORY_ICONS, formatDuration } from '../../utils/format';

// Timeline vertical do dia. Recebe os itens JÁ decorados (status,
// isCurrent, isNext - ver utils/timeline.js), então não decide nada:
// só desenha. Serve ao Dashboard (hoje) e ao Diário (qualquer dia).
function TodayTimeline({ title = 'Agenda de hoje', items, onToggle, pendingId }) {
  const checkable = items.filter((item) => item.checkable);
  const doneCount = checkable.filter((item) => item.status === 'done').length;

  return (
    <Card title={title} subtitle={checkable.length > 0 ? `${doneCount} de ${checkable.length} feitas` : undefined}>
      {items.length === 0 ? (
        <p className="empty-state">
          Nenhuma atividade neste dia. Monte sua rotina em <Link to="/activities">Atividades</Link>.
        </p>
      ) : (
        <ol className="timeline">
          {items.map((item) => (
            <li key={item.id} className="timeline-item" data-status={item.status} data-current={item.isCurrent}>
              <span className="timeline-time">{item.startTime}</span>
              <span className="timeline-rail">
                <span className="timeline-dot" />
              </span>

              <div className="timeline-body">
                <span className="timeline-emoji" aria-hidden="true">{CATEGORY_ICONS[item.category]}</span>
                <div className="timeline-main">
                  <div className="timeline-name">{item.name}</div>
                  <div className="timeline-meta">
                    <span>{formatDuration(item.durationMinutes)}</span>
                    {item.isCurrent && <span className="chip chip--accent">Agora</span>}
                    {!item.isCurrent && item.isNext && <span className="chip">A seguir</span>}
                    {item.status === 'pending' && <span className="chip chip--warning">Pendente</span>}
                  </div>
                </div>

                {item.checkable && (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.status === 'done'}
                    aria-label={`Marcar ${item.name} como feita`}
                    className="btn-reset check-btn"
                    disabled={pendingId === item.id}
                    onClick={() => onToggle(item)}
                  >
                    <Icon name="check" strokeWidth={3} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default TodayTimeline;
