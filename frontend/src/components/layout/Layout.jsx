import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta } from '../../config/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = getRouteMeta(pathname);

  // Trocou de página -> fecha o drawer (celular)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Esc fecha o drawer
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <div className="main">
        <Topbar onMenuClick={() => setMenuOpen(true)} showGreeting={pathname === '/'} />
        <main className={`page page--${meta.width}`}>{children}</main>
      </div>
    </div>
  );
}

export default Layout;
