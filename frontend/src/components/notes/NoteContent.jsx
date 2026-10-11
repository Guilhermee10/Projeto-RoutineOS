import { parseNoteContent } from '../../utils/noteContent';

// Desenha o texto de uma anotação (parágrafos, listas e checklists).
// Se `onToggle` vier, os checklists ficam clicáveis; senão, só leitura.
// `maxLines` corta o conteúdo (usado nos cartões compactos).
function NoteContent({ content, onToggle, maxLines }) {
  let blocks = parseNoteContent(content).filter((b) => b.type !== 'blank');
  const truncated = maxLines && blocks.length > maxLines;
  if (maxLines) blocks = blocks.slice(0, maxLines);

  return (
    <div className="note-content">
      {blocks.map((block) => {
        if (block.type === 'check') {
          return (
            <label className={`note-line note-check${block.checked ? ' is-done' : ''}`} key={block.index}>
              <input
                type="checkbox"
                checked={block.checked}
                disabled={!onToggle}
                onChange={() => onToggle?.(block.index)}
              />
              <span>{block.text}</span>
            </label>
          );
        }
        if (block.type === 'bullet') {
          return (
            <div className="note-line note-bullet" key={block.index}>
              <span aria-hidden="true">•</span>
              <span>{block.text}</span>
            </div>
          );
        }
        return <p className="note-line note-text" key={block.index}>{block.text}</p>;
      })}
      {truncated && <span className="note-more">…</span>}
    </div>
  );
}

export default NoteContent;
