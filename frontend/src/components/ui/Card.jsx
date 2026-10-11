// Container padrão dos blocos do dashboard: título, subtítulo e ação opcionais.
function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;
