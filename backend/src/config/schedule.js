// Janela do dia em que faz sentido considerar "tempo livre" e sugerir
// atividades. Fora dela (madrugada), assumimos que o usuário está
// dormindo. Hoje é uma constante; no futuro pode virar configuração
// por usuário (ex: quem trabalha à noite tem outra janela).
const WAKING_WINDOW = { dayStart: '06:00', dayEnd: '23:00' };

module.exports = { WAKING_WINDOW };
