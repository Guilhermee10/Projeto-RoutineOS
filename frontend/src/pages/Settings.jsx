import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';

const SHORTCUTS = [
  { to: '/work-schedule', title: 'Escala de trabalho', text: 'Dias e horários de trabalho (inclui escalas como 12x36).' },
  { to: '/flexible-goals', title: 'Metas flexíveis', text: 'Rotinas que o otimizador encaixa nos seus espaços livres.' },
  { to: '/activities', title: 'Atividades fixas', text: 'O que se repete toda semana, com deslocamento.' },
  { to: '/sleep', title: 'Meta de sono', text: 'Defina quantas horas você quer dormir.' },
];

function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="dash-stack">
      <Card title="Conta">
        <div className="settings-account">
          <Avatar name={user?.name} />
          <div>
            <strong>{user?.name}</strong>
            <p className="muted">{user?.email}</p>
          </div>
          <button type="button" className="btn-ghost" onClick={logout}>Sair</button>
        </div>
      </Card>

      <Card title="Preferências da rotina" subtitle="Atalhos para o que molda o seu dia">
        <ul className="settings-links">
          {SHORTCUTS.map((s) => (
            <li key={s.to}>
              <Link to={s.to}><strong>{s.title}</strong></Link>
              <p className="muted">{s.text}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default Settings;
