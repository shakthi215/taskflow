import React, { useState } from 'react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import './TaskCard.css';

const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'var(--todo)', bg: 'var(--todo-dim)' },
  'in-progress': { label: 'In Progress', color: 'var(--progress)', bg: 'var(--progress-dim)' },
  'completed': { label: 'Completed', color: 'var(--done)', bg: 'var(--done-dim)' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'var(--low)' },
  medium: { label: 'Medium', color: 'var(--medium)' },
  high: { label: 'High', color: 'var(--high)' }
};

function getDueDateInfo(dueDate, status) {
  const date = new Date(dueDate);
  if (status === 'completed') return { label: format(date, 'MMM d'), urgent: false };
  if (isPast(date) && !isToday(date)) return { label: 'Overdue', urgent: true, sub: format(date, 'MMM d') };
  if (isToday(date)) return { label: 'Due today', urgent: true, sub: 'Today' };
  const days = differenceInDays(date, new Date());
  if (days <= 2) return { label: `${days}d left`, urgent: true, sub: format(date, 'MMM d') };
  return { label: format(date, 'MMM d'), urgent: false };
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const dueInfo = getDueDateInfo(task.dueDate, task.status);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task._id);
  };

  const cycleStatus = () => {
    const cycle = { 'todo': 'in-progress', 'in-progress': 'completed', 'completed': 'todo' };
    onStatusChange(task._id, cycle[task.status]);
  };

  return (
    <div className={`task-card ${deleting ? 'deleting' : ''}`} style={{ '--status-color': status.color }}>
      <div className="task-card__header">
        <button
          className="task-card__status-pill"
          style={{ color: status.color, background: status.bg }}
          onClick={cycleStatus}
          title="Click to cycle status"
        >
          <span className="status-dot" style={{ background: status.color }} />
          {status.label}
        </button>

        <div className="task-card__actions">
          <span
            className="priority-badge mono"
            style={{ color: priority.color }}
          >
            {priority.label}
          </span>
          <div className="task-card__menu-wrapper">
            <button className="task-card__menu-btn" onClick={() => setMenuOpen(o => !o)}>
              ...
            </button>
            {menuOpen && (
              <div className="task-card__dropdown animate-scaleIn">
                <button onClick={() => { onEdit(task); setMenuOpen(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button className="danger" onClick={() => { handleDelete(); setMenuOpen(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="task-card__title">{task.title}</h3>

      {task.description && (
        <p className="task-card__desc">{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div className="task-card__tags">
          {task.tags.map(tag => (
            <span key={tag} className="tag mono">#{tag}</span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        <span className={`due-date mono ${dueInfo.urgent ? 'urgent' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {dueInfo.label}
          {dueInfo.sub && <span className="due-sub"> - {dueInfo.sub}</span>}
        </span>
        <span className="task-card__id mono">
          #{task._id.slice(-6)}
        </span>
      </div>
    </div>
  );
}
