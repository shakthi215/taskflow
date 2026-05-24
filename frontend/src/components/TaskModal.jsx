import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import './TaskModal.css';

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'todo',
  dueDate: format(new Date(), 'yyyy-MM-dd'),
  priority: 'medium',
  tags: ''
};

export default function TaskModal({ open, task, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const firstInput = useRef(null);

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'todo',
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          priority: task.priority || 'medium',
          tags: (task.tags || []).join(', ')
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setTimeout(() => firstInput.current?.focus(), 80);
    }
  }, [open, task]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await onSave(payload);
      onClose();
    } catch (_) {
      // toast handled in hook
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay animate-fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scaleIn">
        <div className="modal__header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal__form">
          <div className={`field ${errors.title ? 'field--error' : ''}`}>
            <label>Title <span className="required">*</span></label>
            <input
              ref={firstInput}
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              maxLength={120}
            />
            {errors.title && <span className="field__error">{errors.title}</span>}
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Add more context..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="field-row">
            <div className={`field ${errors.dueDate ? 'field--error' : ''}`}>
              <label>Due Date <span className="required">*</span></label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
              {errors.dueDate && <span className="field__error">{errors.dueDate}</span>}
            </div>

            <div className="field">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Status</label>
            <div className="status-select">
              {['todo', 'in-progress', 'completed'].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`status-opt ${form.status === s ? 'active' : ''} status-opt--${s}`}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                >
                  {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : 'Completed'}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Tags <span className="field__hint">(comma separated)</span></label>
            <input
              type="text"
              placeholder="design, frontend, bug..."
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
