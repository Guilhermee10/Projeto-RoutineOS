const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const flexibleGoalRoutes = require('./routes/flexibleGoalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sleepRoutes = require('./routes/sleepRoutes');
const studyRoutes = require('./routes/studyRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const workScheduleRoutes = require('./routes/workScheduleRoutes');
const optimizationRoutes = require('./routes/optimizationRoutes');
const scheduledSlotRoutes = require('./routes/scheduledSlotRoutes');
const goalRoutes = require('./routes/goalRoutes');
const reportRoutes = require('./routes/reportRoutes');
const streakRoutes = require('./routes/streakRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiter');
const clientClock = require('./middlewares/clientClock');

const app = express();

// Middlewares globais
app.use(helmet());
// CORS restrito: só o frontend configurado pode chamar a API pelo navegador
// (CORS_ORIGIN aceita vários endereços separados por vírgula).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(morgan('dev'));
// Limite de tamanho do body: evita que alguém mande JSONs gigantes
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiLimiter);
// Lê a data/hora local do usuário (headers X-Client-*) e disponibiliza
// pra getToday() durante esta requisição.
app.use('/api', clientClock);

// Rota de verificação de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'routineos-backend' });
});

// Rotas de domínio
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/flexible-goals', flexibleGoalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/studies', studyRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/work', workScheduleRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/scheduled-slots', scheduledSlotRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notes', noteRoutes);

// As rotas de cada domínio (sleep, studies, workouts...) serão
// registradas aqui, uma a uma, nas próximas sprints.

// Middleware de erro: DEVE ser o último app.use(), depois de
// todas as rotas. É assim que o Express sabe que qualquer erro
// passado via next(error) cai aqui.
app.use(errorMiddleware);

module.exports = app;
