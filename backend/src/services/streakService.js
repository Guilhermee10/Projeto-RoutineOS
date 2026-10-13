const sleepRepository = require('../repositories/sleepRepository');
const studyRepository = require('../repositories/studyRepository');
const workoutRepository = require('../repositories/workoutRepository');
const { calculateStreaks } = require('../utils/streakUtils');
const { getToday } = require('../utils/dateUtils');

async function getStreaks(userId) {
  const today = getToday();
  const [sleepRecords, studySessions, workouts] = await Promise.all([
    sleepRepository.findAllByUser(userId),
    studyRepository.findAllByUser(userId),
    workoutRepository.findAllByUser(userId),
  ]);

  return {
    sleep: calculateStreaks(sleepRecords.map((r) => r.date), today),
    study: calculateStreaks(studySessions.map((s) => s.date), today),
    workout: calculateStreaks(workouts.map((w) => w.date), today),
  };
}

module.exports = { getStreaks };
