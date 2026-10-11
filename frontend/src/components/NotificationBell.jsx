import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';
import Icon from './ui/Icon';

const POLL_INTERVAL_MS = 60_000; // revalida a cada 1min - não precisa ser em tempo real

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function load() {
      notificationService
        .list()
        .then((data) => {
          if (!cancelled) setNotifications(data);
        })
        .catch(() => {
          // Notificação é um extra, não essencial - se falhar, só não
          // mostra nada, não vale poluir a tela com erro por causa disso.
        });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="btn-reset icon-btn notification-bell-button"
        onClick={() => setOpen((prev) => !prev)}
        title="Notificações"
        aria-label="Notificações"
      >
        <Icon name="bell" size={19} />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Notificações</strong>
            <button type="button" className="btn-reset icon-btn" onClick={() => setOpen(false)} aria-label="Fechar">
              <Icon name="close" size={16} />
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="muted" style={{ padding: '0.8rem' }}>Nada por aqui agora.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id}>{n.icon} {n.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
