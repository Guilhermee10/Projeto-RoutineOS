import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { fitGoalsInSlot } from '../../utils/timeline';
import { formatDuration } from '../../utils/format';

// Tempo livre que ainda resta. Cada bloco é clicável e mostra quais metas
// flexíveis (reais, cadastradas por você) cabem nele.
function FreeTimeCard({ slots, flexibleGoals = [], title = 'Tempo livre' }) {
  const [openIndex, setOpenIndex] = useState(null);
  const total = slots.reduce((sum, slot) => sum + slot.durationMinutes, 0);

  return (
    <Card
      title={title}
      action={<Link to="/optimization" className="link-action">Otimizar</Link>}
    >
      {slots.length === 0 ? (
        <p className="empty-state">Nenhum espaço livre relevante restando neste dia.</p>
      ) : (
        <>
          <p className="free-total">
            <strong>{formatDuration(total)}</strong> livres em {slots.length} {slots.length === 1 ? 'bloco' : 'blocos'}
          </p>
          <div className="free-list">
            {slots.map((slot, index) => {
              const open = openIndex === index;
              const picks = open ? fitGoalsInSlot(slot.durationMinutes, flexibleGoals) : [];
              return (
                <button
                  type="button"
                  key={`${slot.start}-${slot.end}`}
                  className="btn-reset free-slot"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="free-slot-top">
                    <span className="free-slot-range">{slot.start} – {slot.end}</span>
                    <span className="free-slot-duration">{formatDuration(slot.durationMinutes)}</span>
                  </span>
                  {open && (
                    <span className="free-fit">
                      {picks.length > 0 ? (
                        <>
                          <span>Cabe:</span>
                          {picks.map((goal) => (
                            <span className="chip chip--accent" key={goal.id}>
                              {goal.name} · {goal.durationMinutes}min
                            </span>
                          ))}
                        </>
                      ) : (
                        <span>Nenhuma meta flexível cadastrada cabe aqui.</span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

export default FreeTimeCard;
