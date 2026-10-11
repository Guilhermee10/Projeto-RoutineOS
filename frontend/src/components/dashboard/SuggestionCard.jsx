import { Link } from 'react-router-dom';
import Card from '../ui/Card';

// Lista de sugestões vindas de utils/suggestions.js. Nenhum texto é
// inventado aqui: sem dado real, o estado vazio é honesto.
function SuggestionCard({ suggestions }) {
  return (
    <Card title="💡 Sugestões para hoje">
      {suggestions.length === 0 ? (
        <p className="empty-state">
          Sem sugestões por enquanto. Elas aparecem conforme você registra sono, estudos, metas e hábitos.
        </p>
      ) : (
        <ul className="suggestion-list">
          {suggestions.map((s) => (
            <li key={s.id} className={`suggestion suggestion--${s.tone}`}>
              <span className="suggestion-icon" aria-hidden="true">{s.icon}</span>
              <p className="suggestion-text">{s.text}</p>
              {s.action && (
                <Link to={s.action.to} className="suggestion-action">{s.action.label}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default SuggestionCard;
