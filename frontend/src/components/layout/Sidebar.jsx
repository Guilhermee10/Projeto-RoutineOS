import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NAV_GROUPS } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';

// Desktop: fixa à esquerda. Tablet: compacta (só ícones, via CSS).
// Celular: vira drawer, aberto/fechado pelo Layout (props open/onClose).
function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Navegação principal">
      <Link to="/" className="sidebar-brand" onClick={onClose}>
        <span className="brand-mark">
          <Icon name="check" size={18} strokeWidth={2.6} />
        </span>
        <span className="brand-name">RoutineOS</span>
      </Link>

      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div className="nav-section" key={group.title}>
            <p className="nav-section-title">{group.title}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={item.label}
                className="nav-item"
                onClick={onClose}
              >
                <Icon name={item.icon} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <Avatar name={user?.name} />
          <div className="sidebar-user-text">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>
        <Link to="/settings" className="icon-btn" title="Configurações" aria-label="Configurações" onClick={onClose}>
          <Icon name="sliders" />
        </Link>
        <button type="button" className="btn-reset icon-btn" onClick={handleLogout} title="Sair" aria-label="Sair">
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
