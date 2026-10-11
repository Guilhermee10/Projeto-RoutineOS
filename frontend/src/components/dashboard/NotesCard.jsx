import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import NoteContent from '../notes/NoteContent';
import { getChecklistProgress } from '../../utils/noteContent';

// Anotações recentes + campo de nota rápida. Falhar aqui nunca derruba o
// Dashboard: o pai só renderiza se a lista carregou.
function NotesCard({ notes, onQuickAdd }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onQuickAdd(text.trim());
      setText('');
    } catch {
      setError('Não foi possível salvar a anotação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Anotações" action={<Link to="/notes" className="link-action">Ver todas</Link>}>
      <form className="quick-note" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Anotação rápida..."
          aria-label="Anotação rápida"
          maxLength={500}
        />
        <button type="submit" disabled={saving || !text.trim()}>Salvar</button>
      </form>
      {error && <p className="alert-error">{error}</p>}

      {notes.length === 0 ? (
        <p className="empty-state">Nenhuma anotação ainda.</p>
      ) : (
        <ul className="quick-note-list">
          {notes.map((note) => {
            const progress = getChecklistProgress(note.content);
            return (
              <li key={note.id}>
                <Link to="/notes" className="quick-note-item">
                  <strong>{note.title || 'Sem título'}</strong>
                  {progress.total > 0 && <span className="chip">{progress.done}/{progress.total}</span>}
                  <NoteContent content={note.content} maxLines={2} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export default NotesCard;
