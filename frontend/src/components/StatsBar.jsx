import React from 'react';
import './StatsBar.css';

export default function StatsBar({ stats }) {
  if (!stats) return <div className="stats-bar skeleton" style={{ height: 88 }} />;

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const items = [
    { label: 'Total', value: stats.total, color: 'var(--accent)' },
    { label: 'To Do', value: stats.todo, color: 'var(--todo)' },
    { label: 'In Progress', value: stats.inProgress, color: 'var(--progress)' },
    { label: 'Completed', value: stats.completed, color: 'var(--done)' },
    { label: 'Overdue', value: stats.overdue, color: 'var(--danger)' }
  ];

  return (
    <div className="stats-bar">
      <div className="stats-bar__cards">
        {items.map(item => (
          <div key={item.label} className="stat-card" style={{ '--c': item.color }}>
            <span className="stat-card__value mono">{item.value}</span>
            <span className="stat-card__label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="stats-bar__progress">
        <div className="progress-header">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-pct mono">{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
