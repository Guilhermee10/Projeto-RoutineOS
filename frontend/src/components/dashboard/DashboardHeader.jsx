import { getGreeting, formatLongDate, getFirstName } from '../../utils/greeting';

// Saudação que muda com o horário + data por extenso.
function DashboardHeader({ name, now }) {
  return (
    <div className="greeting">
      <h1 className="greeting-title">
        {getGreeting(now)}, {getFirstName(name)} <span aria-hidden="true">👋</span>
      </h1>
      <p className="greeting-date">{formatLongDate(now)}</p>
    </div>
  );
}

export default DashboardHeader;
