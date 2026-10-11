import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import ProgressBar from '../ui/ProgressBar';

// Metas da semana com progresso e check-in do dia.
function GoalsCard({ goals, onToggle, pendingId }) {
  return (
    <Card title="Metas da semana" action={<Link to="/goals" className="link-action">Ver todas</Link>}>
      {goals.length === 0 ? (
        <p className="empty-state">Nenhuma meta ainda. Crie uma em <Link to="/goals">Metas</Link>.</p>
      ) : (
        <div className="goal-rows">
          {goals.map((goal) => {
            const pct = Math.round(goal.progress?.percentage ?? 0);
            return (
              <div className="goal-row" key={goal.id}>
                <div>
                  <div className="goal-row-top">
                    <span className={`goal-row-name${goal.checkedInToday ? ' is-done' : ''}`}>{goal.name}</span>
                    <span className="goal-row-pct">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} size="sm" tone={pct >= 100 ? 'success' : 'accent'} label={goal.name} />
                </div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={!!goal.checkedInToday}
                  aria-label={`Marcar ${goal.name} como feita hoje`}
                  className="btn-reset check-btn"
                  disabled={pendingId === goal.id}
                  onClick={() => onToggle(goal)}
                >
                  <Icon name="check" strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default GoalsCard;
