import { useEffect, useState } from 'react';
import optimizationService from '../services/optimizationService';
import scheduledSlotService from '../services/scheduledSlotService';
import { formatDateDisplay } from '../utils/format';

// Agrupa os slots por data (string "AAAA-MM-DD") pra renderizar um
// bloco por dia, na ordem que a API já devolve (data + horário asc).
function groupByDate(slots) {
  const groups = new Map();
  for (const slot of slots) {
    const key = slot.date.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(slot);
  }
  return Array.from(groups.entries());
}

function OptimizationPage() {
  const [suggested, setSuggested] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [unmet, setUnmet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [actingOnId, setActingOnId] = useState(null); // evita duplo-clique na mesma sugestão

  useEffect(() => {
    loadSlots();
  }, []);

  function loadSlots() {
    setLoading(true);
    Promise.all([scheduledSlotService.list('SUGGESTED'), scheduledSlotService.list('CONFIRMED')])
      .then(([suggestedData, confirmedData]) => {
        setSuggested(suggestedData);
        setConfirmed(confirmedData);
      })
      .catch(() => setError('Não foi possível carregar as sugestões.'))
      .finally(() => setLoading(false));
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setError('');
    try {
      const result = await optimizationService.analyze();
      setUnmet(result.unmet);
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao analisar a semana.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleConfirm(id) {
    setActingOnId(id);
    try {
      await scheduledSlotService.confirm(id);
      loadSlots();
    } finally {
      setActingOnId(null);
    }
  }

  async function handleReject(id) {
    setActingOnId(id);
    try {
      await scheduledSlotService.reject(id);
      loadSlots();
    } finally {
      setActingOnId(null);
    }
  }

  const suggestedByDate = groupByDate(suggested);
  const confirmedByDate = groupByDate(confirmed);

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Motor de Otimização</h1>
        <button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analisando...' : 'Analisar semana'}
        </button>
      </div>

      <p className="muted">
        Olha sua semana, encaixa suas metas flexíveis nos espaços livres (e no
        transporte, quando compatível) e sugere horários. Nada é movido sem
        você confirmar.
      </p>

      {error && <p className="alert-error">{error}</p>}

      {unmet.length > 0 && (
        <section className="card">
          <h2>⚠️ Não coube tudo</h2>
          <ul className="category-list">
            {unmet.map((item) => (
              <li key={item.flexibleGoalId}>
                <span>{item.name}</span>
                <strong>{item.placed}/{item.requested} encaixadas</strong>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ marginTop: '0.6rem', marginBottom: 0 }}>
            Sinal de que a rotina está sobrecarregada pra essas metas - talvez
            valha reduzir a frequência ou abrir mais espaço livre.
          </p>
        </section>
      )}

      {loading && <p className="muted">Carregando sugestões...</p>}

      <section>
        <h2>Sugestões pendentes</h2>
        {!loading && suggested.length === 0 && (
          <p className="muted">Nenhuma sugestão pendente - clique em "Analisar semana" pra gerar.</p>
        )}
        {suggestedByDate.map(([date, slots]) => (
          <div key={date} className="card">
            <strong>{formatDateDisplay(date)}</strong>
            <ul className="agenda-list" style={{ marginTop: '0.5rem' }}>
              {slots.map((slot) => (
                <li key={slot.id}>
                  <span>
                    <span className="agenda-time">{slot.startTime} - {slot.endTime}</span>
                    {slot.flexibleGoal?.name}
                    {slot.duringCommute && <span className="tag" style={{ marginLeft: '0.5rem' }}>🚌 transporte</span>}
                  </span>
                  <span className="activity-actions">
                    <button
                      className="btn-ghost"
                      disabled={actingOnId === slot.id}
                      onClick={() => handleConfirm(slot.id)}
                    >
                      Confirmar
                    </button>
                    <button
                      className="btn-ghost"
                      disabled={actingOnId === slot.id}
                      onClick={() => handleReject(slot.id)}
                    >
                      Rejeitar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {confirmed.length > 0 && (
        <section>
          <h2>Confirmadas essa semana</h2>
          {confirmedByDate.map(([date, slots]) => (
            <div key={date} className="card">
              <strong>{formatDateDisplay(date)}</strong>
              <ul className="agenda-list" style={{ marginTop: '0.5rem' }}>
                {slots.map((slot) => (
                  <li key={slot.id}>
                    <span>
                      <span className="agenda-time">{slot.startTime} - {slot.endTime}</span>
                      {slot.flexibleGoal?.name}
                      {slot.duringCommute && <span className="tag" style={{ marginLeft: '0.5rem' }}>🚌 transporte</span>}
                    </span>
                    <button
                      className="btn-ghost"
                      disabled={actingOnId === slot.id}
                      onClick={() => handleReject(slot.id)}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default OptimizationPage;
