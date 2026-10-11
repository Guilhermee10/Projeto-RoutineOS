import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

// Dois grupos de navegação, como decidimos: "Diário" é o que se usa
// todo dia (registrar sono, estudo, treino, ver o dashboard);
// "Configuração" é o que se cadastra uma vez e raramente muda
// (atividades fixas, escala de trabalho, metas, relatório).
const DAILY_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/habits', label: 'Hábitos' },
  { to: '/calendar', label: 'Calendário' },
  { to: '/sleep', label: 'Sono' },
  { to: '/study', label: 'Estudos' },
  { to: '/workouts', label: 'Treinos' },
];

const CONFIG_LINKS = [
  { to: '/activities', label: 'Atividades' },
  { to: '/work-schedule', label: 'Trabalho' },
  { to: '/flexible-goals', label: 'Metas Flexíveis' },
  { to: '/goals', label: 'Metas' },
  { to: '/optimization', label: 'Otimização' },
  { to: '/reports', label: 'Relatório' },
];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">RoutineOS</Link>
        <div className="user-area">
          <NotificationBell />
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-ghost">Sair</button>
        </div>
      </header>

      <nav className="nav-links">
        <div className="nav-group">
          <span className="nav-group-label">Diário</span>
          {DAILY_LINKS.map((link) => (
            // "end" faz o Dashboard ("/") só ficar ativo na rota exata,
            // senão ele ficaria marcado como ativo em qualquer página.
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-group">
          <span className="nav-group-label">Configuração</span>
          {CONFIG_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
          ))}
        </div>
      </nav>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;
