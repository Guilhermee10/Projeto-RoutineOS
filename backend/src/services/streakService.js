const sleepRepository = require('../repositories/sleepRepository');
const studyRepository = require('../repositories/studyRepository');
const workoutRepository = require('../repositories/workoutRepository');
const { calculateStreaks } = require('../utils/streakUtils');

async function getStreaks(userId) {
  const [sleepRecords, studySessions, workouts] = await Promise.all([
    sleepRepository.findAllByUser(userId),
    studyRepository.findAllByUser(userId),
    workoutRepository.findAllByUser(userId),
  ]);

  return {
    sleep: calculateStreaks(sleepRecords.map((r) => r.date)),
    study: calculateStreaks(studySessions.map((s) => s.date)),
    workout: calculateStreaks(workouts.map((w) => w.date)),
  };
}

module.exports = { getStreaks };
