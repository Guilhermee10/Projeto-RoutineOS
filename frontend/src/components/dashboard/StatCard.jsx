import ProgressBar from '../ui/ProgressBar';

// Cartão compacto de métrica: ícone, título, valor, info secundária e
// (opcional) barra de progresso + um selo à direita (ex: sequência 🔥).
function StatCard({ icon, title, value, target, hint, progress = null, progressTone = 'accent', badge }) {
  return (
    <article className="panel stat-card">
      <header className="stat-head">
        <span className="stat-icon" aria-hidden="true">{icon}</span>
        <h3 className="stat-title">{title}</h3>
        {badge}
      </header>

      <p className="stat-value">
        <span className="stat-value-main">{value}</span>
        {target && <span className="stat-value-target">{target}</span>}
      </p>

      {hint && <p className="stat-hint">{hint}</p>}
      {progress !== null && <ProgressBar value={progress} tone={progressTone} label={title} />}
    </article>
  );
}

export default StatCard;
