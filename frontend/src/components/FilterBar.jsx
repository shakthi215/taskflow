import React from 'react';
import './FilterBar.css';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const PRIORITIES = [
  { value: '', label: 'Any Priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

const SORTS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'createdAt', label: 'Created' },
  { value: 'priority', label: 'Priority' }
];

export default function FilterBar({ filters, onChange, onAdd }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filter-bar">
      <div className="filter-bar__left">
        <div className="status-tabs">
          {STATUSES.map(s => (
            <button
              key={s.value}
              className={`status-tab ${filters.status === s.value ? 'active' : ''}`}
              onClick={() => set('status', s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          className="filter-select"
          value={filters.priority || ''}
          onChange={e => set('priority', e.target.value)}
        >
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select
          className="filter-select"
          value={filters.sortBy || 'dueDate'}
          onChange={e => set('sortBy', e.target.value)}
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button
          className={`order-btn ${filters.order === 'desc' ? 'active' : ''}`}
          onClick={() => set('order', filters.order === 'desc' ? 'asc' : 'desc')}
          title="Toggle sort order"
        >
          {filters.order === 'desc' ? 'Desc' : 'Asc'}
        </button>
      </div>

      <button className="add-btn" onClick={onAdd}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Task
      </button>
    </div>
  );
}
