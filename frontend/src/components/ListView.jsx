import React from 'react';
import TaskCard from './TaskCard';
import './ListView.css';

export default function ListView({ tasks, onEdit, onDelete, onStatusChange }) {
  if (tasks.length === 0) {
    return (
      <div className="list-empty">
        <div className="list-empty__icon">TF</div>
        <p>No tasks found</p>
        <span>Create a new task to get started</span>
      </div>
    );
  }

  return (
    <div className="list-view">
      {tasks.map((task, i) => (
        <div key={task._id} style={{ animationDelay: `${i * 35}ms` }}>
          <TaskCard
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        </div>
      ))}
    </div>
  );
}
