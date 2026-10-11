// Formato do conteúdo de uma anotação (texto puro, uma linha = um bloco):
//   "- item"        -> item de lista
//   "- [ ] tarefa"  -> checklist pendente
//   "- [x] tarefa"  -> checklist feita
//   qualquer outra  -> parágrafo (linha vazia vira espaço)
// Guardar como texto puro mantém o banco simples e deixa o editor ser um
// <textarea> comum. Esta lib é a única que conhece o formato.

const CHECK_RE = /^(\s*)- \[( |x|X)\]\s?(.*)$/;
const BULLET_RE = /^(\s*)- (.*)$/;

export function parseNoteContent(content = '') {
  return content.split('\n').map((line, index) => {
    const check = line.match(CHECK_RE);
    if (check) return { index, type: 'check', checked: check[2].toLowerCase() === 'x', text: check[3] };
    const bullet = line.match(BULLET_RE);
    if (bullet) return { index, type: 'bullet', text: bullet[2] };
    if (!line.trim()) return { index, type: 'blank', text: '' };
    return { index, type: 'text', text: line };
  });
}

// Marca/desmarca o checklist da linha `lineIndex` e devolve o novo texto.
// Linhas que não são checklist ficam intactas.
export function toggleChecklistLine(content, lineIndex) {
  const lines = content.split('\n');
  const line = lines[lineIndex];
  const match = line?.match(CHECK_RE);
  if (!match) return content;
  const nextMark = match[2].toLowerCase() === 'x' ? ' ' : 'x';
  lines[lineIndex] = `${match[1]}- [${nextMark}] ${match[3]}`;
  return lines.join('\n');
}

export function getChecklistProgress(content = '') {
  const checks = parseNoteContent(content).filter((b) => b.type === 'check');
  return { total: checks.length, done: checks.filter((b) => b.checked).length };
}

// Prefixo da linha pra "continuar a lista" ao apertar Enter. Se a linha
// atual é um item VAZIO, devolve { clear: true } (Enter duas vezes sai da lista).
export function getContinuationPrefix(line) {
  const check = line.match(CHECK_RE);
  if (check) return check[3].trim() ? { prefix: `${check[1]}- [ ] ` } : { clear: true };
  const bullet = line.match(BULLET_RE);
  if (bullet) return bullet[2].trim() ? { prefix: `${bullet[1]}- ` } : { clear: true };
  return null;
}

// Liga/desliga um prefixo ("- " ou "- [ ] ") nas linhas selecionadas.
export function toggleLinePrefix(text, selStart, selEnd, kind) {
  const prefix = kind === 'check' ? '- [ ] ' : '- ';
  const startLine = text.lastIndexOf('\n', selStart - 1) + 1;
  const endIdx = text.indexOf('\n', selEnd);
  const endLine = endIdx === -1 ? text.length : endIdx;
  const lines = text.slice(startLine, endLine).split('\n');

  const strip = (l) => l.replace(/^- \[( |x|X)\] ?/, '').replace(/^- /, '');
  const allHave = lines.every((l) => (kind === 'check' ? CHECK_RE.test(l) : BULLET_RE.test(l) && !CHECK_RE.test(l)));
  const next = lines.map((l) => (allHave ? strip(l) : `${prefix}${strip(l)}`)).join('\n');

  return { text: text.slice(0, startLine) + next + text.slice(endLine), selStart: startLine, selEnd: startLine + next.length };
}
