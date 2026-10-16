import { useEffect, useState } from 'react';
import reportService from '../services/reportService';
import { formatMinutes, formatDateDisplay } from '../utils/format';

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  // aviso neutro (não é erro): recurso opcional desativado no servidor
  const [aiNotice, setAiNotice] = useState('');

  useEffect(() => {
    reportService
      .getWeekly()
      .then(setReport)
      .catch(() => setError('Não foi possível carregar o relatório.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerateAiSummary() {
    setAiLoading(true);
    setAiError('');
    setAiNotice('');
    try {
      const result = await reportService.getAiSummary();
      setAiSummary(result.summary);
    } catch (err) {
      if (err.response?.status === 503) {
        // 503 = recurso opcional sem API key no backend: não é uma falha,
        // então mostramos um aviso informativo em vez de um erro vermelho.
        setAiNotice(
          err.response?.data?.error ||
            'O resumo por IA é um recurso opcional e está desativado nesta demonstração.'
        );
      } else {
        // outros erros: falha ao chamar a API da Anthropic (rede, limite, etc.)
        setAiError(err.response?.data?.error || 'Não foi possível gerar o resumo agora.');
      }
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return <p className="muted">Carregando relatório...</p>;
  if (error) return <p className="alert-error">{error}</p>;

  const studyDiff = report.study.diffFromPreviousWeekMinutes;

  return (
    <div>
      <h1>📊 Relatório Semanal</h1>
      <p className="muted">{formatDateDisplay(report.weekStart)} a {formatDateDisplay(report.weekEnd)}</p>

      <section className="card">
        <h2>✨ Resumo da Semana (IA)</h2>
        {aiSummary && <p>{aiSummary}</p>}
        {aiNotice && <p className="muted">ℹ️ {aiNotice}</p>}
        {aiError && <p className="alert-error">{aiError}</p>}
        <button onClick={handleGenerateAiSummary} disabled={aiLoading}>
          {aiLoading ? 'Gerando...' : aiSummary ? 'Gerar de novo' : 'Gerar resumo'}
        </button>
      </section>

      <section className="card stats-grid">
        <div><span className="muted">😴 Sono (média)</span><strong>{formatMinutes(report.sleep.averageMinutes)}</strong></div>
        <div><span className="muted">💼 Trabalho</span><strong>{formatMinutes(report.work.totalMinutes)}</strong></div>
        <div><span className="muted">🚌 Transporte</span><strong>{formatMinutes(report.commute.totalMinutes)}</strong></div>
      </section>

      <section className="card stats-grid">
        <div>
          <span className="muted">📚 Estudos</span>
          <strong>{formatMinutes(report.study.totalMinutes)}</strong>
          <span className={studyDiff >= 0 ? 'text-success' : 'text-warning'} style={{ fontSize: '0.85rem' }}>
            {studyDiff >= 0 ? '+' : ''}{formatMinutes(Math.abs(studyDiff))} vs. semana anterior
          </span>
        </div>
        <div>
          <span className="muted">🏋️ Treinos</span>
          <strong>{formatMinutes(report.workouts.totalMinutes)}</strong>
          <span className="muted" style={{ fontSize: '0.85rem' }}>{report.workouts.count} treino(s)</span>
        </div>
      </section>

      <section className="card">
        <h2>Tempo livre</h2>
        <p>Total na semana: <strong>{formatMinutes(report.freeTime.totalMinutes)}</strong></p>
        {report.freeTime.biggestWindow && (
          <p className="muted">
            Maior janela: {formatDateDisplay(report.freeTime.biggestWindow.date)}, {' '}
            {report.freeTime.biggestWindow.start} - {report.freeTime.biggestWindow.end}
            {' '}({formatMinutes(report.freeTime.biggestWindow.durationMinutes)})
          </p>
        )}
        <p className="muted" style={{ marginBottom: 0 }}>
          {report.goalsUsagePercentage}% do tempo livre foi usado por metas confirmadas essa semana.
        </p>
      </section>
    </div>
  );
}

export default Reports;
