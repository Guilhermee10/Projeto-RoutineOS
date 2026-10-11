import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import HabitGrid from './pages/HabitGrid';
import WeekCalendar from './pages/WeekCalendar';
import Sleep from './pages/Sleep';
import Study from './pages/Study';
import Workout from './pages/Workout';
import FlexibleGoals from './pages/FlexibleGoals';
import WorkSchedule from './pages/WorkSchedule';
import OptimizationPage from './pages/OptimizationPage';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Diary from './pages/Diary';
import Settings from './pages/Settings';
import Notes from './pages/Notes';

// Toda rota protegida segue o mesmo molde (ProtectedRoute + Layout em
// volta da página) - em vez de repetir esse bloco pra cada uma, a
// gente descreve só o essencial aqui e gera as <Route> num .map().
// Isso também significa que adicionar uma tela nova vira UMA linha.
const PROTECTED_ROUTES = [
  { path: '/', Page: Dashboard },
  { path: '/activities', Page: Activities },
  { path: '/habits', Page: HabitGrid },
  { path: '/calendar', Page: WeekCalendar },
  { path: '/sleep', Page: Sleep },
  { path: '/study', Page: Study },
  { path: '/workouts', Page: Workout },
  { path: '/flexible-goals', Page: FlexibleGoals },
  { path: '/work-schedule', Page: WorkSchedule },
  { path: '/optimization', Page: OptimizationPage },
  { path: '/goals', Page: Goals },
  { path: '/reports', Page: Reports },
  { path: '/diary', Page: Diary },
  { path: '/settings', Page: Settings },
  { path: '/notes', Page: Notes },
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {PROTECTED_ROUTES.map(({ path, Page }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Layout>
                    <Page />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
