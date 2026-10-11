const { timeToMinutes } = require('./timeUtils');
const { minutesToTime } = require('./dashboardUtils');

// Um "pool" de janelas de tempo disponíveis (ex: os espaços livres de
// um dia, ou os blocos de transporte de um dia). Cada chamada a
// claim(duration) tenta reservar um pedaço, consumindo do INÍCIO da
// primeira janela que tenha espaço suficiente - e encolhendo essa
// janela pro próximo interessado.
function createTimePool(windows) {
  const state = windows.map((w) => ({
    startMinutes: timeToMinutes(w.start ?? w.startTime),
    endMinutes: timeToMinutes(w.end ?? w.endTime),
  }));

  function claim(durationMinutes) {
    const window = state.find((w) => w.endMinutes - w.startMinutes >= durationMinutes);
    if (!window) return null;

    const start = window.startMinutes;
    const end = start + durationMinutes;
    window.startMinutes = end; // encolhe a janela pro próximo claim

    return { startTime: minutesToTime(start), endTime: minutesToTime(end) };
  }

  return { claim };
}

module.exports = { createTimePool };
