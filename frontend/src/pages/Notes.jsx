import { useCallback, useEffect, useState } from 'react';
import noteService from '../services/noteService';
import goalService from '../services/goalService';
import NoteEditor from '../components/notes/NoteEditor';
import NoteContent from '../components/notes/NoteContent';
import { getChecklistProgress, toggleChecklistLine } from '../utils/noteContent';

function formatUpdated(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function Notes() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [goals, setGoals] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null); // null | {} (nova) | nota
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // espera o usuário parar de digitar antes de buscar no servidor
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      noteService.list({ q: debouncedSearch || undefined, tag: activeTag || undefined, archived: showArchived }),
      noteService.listTags(),
    ])
      .then(([notesData, tagsData]) => {
        setNotes(notesData);
        setTags(tagsData);
        setError('');
      })
      .catch(() => setError('Não foi possível carregar as anotações.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, activeTag, showArchived]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    goalService.list().then(setGoals).catch(() => setGoals([]));
  }, []);

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editing?.id) await noteService.update(editing.id, form);
      else await noteService.create(form);
      setEditing(null);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function patchNote(note, patch) {
    await noteService.update(note.id, patch);
    load();
  }

  async function handleToggleCheck(note, lineIndex) {
    const content = toggleChecklistLine(note.content, lineIndex);
    // otimista: marca na hora, o servidor confirma em seguida
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, content } : n)));
    try {
      await noteService.update(note.id, { content });
    } catch {
      load();
    }
  }

  async function handleDelete(note) {
    if (!window.confirm('Remover essa anotação?')) return;
    await noteService.remove(note.id);
    load();
  }

  const goalName = (id) => goals.find((g) => g.id === id)?.name;

  return (
    <div>
      <div className="page-header">
        <h1>📝 Anotações</h1>
        {!editing && <button onClick={() => setEditing({})}>+ Nova anotação</button>}
      </div>

      {editing && (
        <NoteEditor
          key={editing.id || 'new'}
          initialValues={editing}
          goals={goals}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          submitting={submitting}
        />
      )}

      <div className="notes-toolbar">
        <input
          type="search"
          placeholder="Buscar nas anotações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={showArchived ? 'day-chip active' : 'day-chip'}
          onClick={() => setShowArchived((v) => !v)}
        >
          Arquivadas
        </button>
      </div>

      {tags.length > 0 && (
        <div className="notes-tags">
          <button type="button" className={!activeTag ? 'day-chip active' : 'day-chip'} onClick={() => setActiveTag('')}>
            Todas
          </button>
          {tags.map(({ tag, count }) => (
            <button
              type="button"
              key={tag}
              className={activeTag === tag ? 'day-chip active' : 'day-chip'}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
            >
              #{tag} <span className="muted">{count}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="alert-error">{error}</p>}
      {loading && notes.length === 0 && <p className="muted">Carregando...</p>}
      {!loading && notes.length === 0 && (
        <p className="empty-state">
          {debouncedSearch || activeTag
            ? 'Nenhuma anotação encontrada com esse filtro.'
            : showArchived
              ? 'Nenhuma anotação arquivada.'
              : 'Nenhuma anotação ainda. Crie a primeira!'}
        </p>
      )}

      <div className="notes-grid">
        {notes.map((note) => {
          const progress = getChecklistProgress(note.content);
          return (
            <article className={`panel note-card${note.pinned ? ' is-pinned' : ''}`} key={note.id}>
              <header className="note-card-head">
                <h2 className="note-card-title">{note.title || 'Sem título'}</h2>
                <button
                  type="button"
                  className="btn-reset note-pin"
                  title={note.pinned ? 'Desafixar' : 'Fixar no topo'}
                  aria-pressed={note.pinned}
                  onClick={() => patchNote(note, { pinned: !note.pinned })}
                >
                  {note.pinned ? '📌' : '📍'}
                </button>
              </header>

              <NoteContent content={note.content} onToggle={(i) => handleToggleCheck(note, i)} />

              <footer className="note-card-foot">
                <div className="note-meta">
                  {progress.total > 0 && (
                    <span className={`chip ${progress.done === progress.total ? 'chip--success' : ''}`.trim()}>
                      {progress.done}/{progress.total}
                    </span>
                  )}
                  {note.goalId && goalName(note.goalId) && <span className="chip chip--accent">🎯 {goalName(note.goalId)}</span>}
                  {note.tags.map((tag) => (
                    <span className="chip" key={tag}>#{tag}</span>
                  ))}
                  <span className="muted note-date">{formatUpdated(note.updatedAt)}</span>
                </div>
                <div className="activity-actions">
                  <button className="btn-ghost" onClick={() => setEditing(note)}>Editar</button>
                  <button className="btn-ghost" onClick={() => patchNote(note, { archived: !note.archived })}>
                    {note.archived ? 'Restaurar' : 'Arquivar'}
                  </button>
                  <button className="btn-ghost" onClick={() => handleDelete(note)}>Remover</button>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Notes;
