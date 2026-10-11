import { useRef, useState } from 'react';
import { getContinuationPrefix, toggleLinePrefix } from '../../utils/noteContent';

// Editor de anotação: <textarea> comum + dois botões de formatação e a
// continuação automática de listas ao apertar Enter. Nada de editor rico.
function NoteEditor({ initialValues, goals, onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [tagsText, setTagsText] = useState((initialValues?.tags || []).join(', '));
  const [goalId, setGoalId] = useState(initialValues?.goalId || '');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  function applyEdit({ text, selStart, selEnd }) {
    setContent(text);
    // devolve o foco e a seleção depois que o React atualiza o textarea
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      }
    });
  }

  function handleFormat(kind) {
    const el = textareaRef.current;
    applyEdit(toggleLinePrefix(content, el.selectionStart, el.selectionEnd, kind));
  }

  function handleKeyDown(e) {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    const el = e.target;
    if (el.selectionStart !== el.selectionEnd) return;

    const pos = el.selectionStart;
    const lineStart = content.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = content.indexOf('\n', pos);
    const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);
    const result = getContinuationPrefix(line);
    if (!result) return;

    e.preventDefault();
    if (result.clear) {
      // Enter num item vazio: remove o marcador e sai da lista
      const next = content.slice(0, lineStart) + content.slice(lineStart + line.length);
      applyEdit({ text: next, selStart: lineStart, selEnd: lineStart });
      return;
    }
    const insert = `\n${result.prefix}`;
    const next = content.slice(0, pos) + insert + content.slice(pos);
    const caret = pos + insert.length;
    applyEdit({ text: next, selStart: caret, selEnd: caret });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() && !content.trim()) {
      setError('Escreva um título ou um conteúdo.');
      return;
    }
    try {
      await onSubmit({
        title: title.trim(),
        content,
        tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
        goalId: goalId || null,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar anotação.');
    }
  }

  return (
    <form className="card note-editor" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}

      <input
        className="note-title-input"
        placeholder="Título"
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      <div className="note-toolbar">
        <button type="button" className="btn-ghost" onClick={() => handleFormat('bullet')}>• Lista</button>
        <button type="button" className="btn-ghost" onClick={() => handleFormat('check')}>☑ Checklist</button>
        <span className="muted">Enter continua a lista; Enter num item vazio sai dela.</span>
      </div>

      <textarea
        ref={textareaRef}
        className="note-textarea"
        rows={10}
        placeholder="Escreva aqui..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="form-row">
        <label>
          Tags (separadas por vírgula)
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="Ex: aws, inglês" />
        </label>
        <label>
          Meta (opcional)
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">Nenhuma</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default NoteEditor;
