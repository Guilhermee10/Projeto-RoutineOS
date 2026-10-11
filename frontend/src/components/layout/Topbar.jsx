import { useAuth } from '../../context/AuthContext';
import { useNow } from '../../hooks/useNow';
import { formatLongDate } from '../../utils/greeting';
import NotificationBell from '../NotificationBell';
import DashboardHeader from '../dashboard/DashboardHeader';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';

// Esquerda: saudação (Dashboard) ou só a data (demais telas).
// Direita: notificações + usuário. No celular, ganha o botão de menu.
function Topbar({ onMenuClick, showGreeting }) {
  const { user } = useAuth();
  const now = useNow(60_000);

  return (
    <header className="topbar">
      <button type="button" className="btn-reset icon-btn menu-button" onClick={onMenuClick} aria-label="Abrir menu">
        <Icon name="menu" size={20} />
      </button>

      <div className="topbar-left">
        {showGreeting ? (
          <DashboardHeader name={user?.name} now={now} />
        ) : (
          <p className="topbar-date">{formatLongDate(now)}</p>
        )}
      </div>

      <div className="topbar-right">
        <NotificationBell />
        <div className="topbar-user">
          <Avatar name={user?.name} />
          <span className="topbar-user-name">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
