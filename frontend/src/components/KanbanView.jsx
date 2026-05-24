import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import TaskCard from './TaskCard';
import './KanbanView.css';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'var(--todo)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--progress)' },
  { key: 'completed', label: 'Completed', color: 'var(--done)' }
];

function centerOverlayOnCursor({ activatorEvent, draggingNodeRect, transform }) {
  if (!activatorEvent || !draggingNodeRect) return transform;

  const point = 'touches' in activatorEvent
    ? activatorEvent.touches[0]
    : activatorEvent;

  if (!point || typeof point.clientX !== 'number' || typeof point.clientY !== 'number') {
    return transform;
  }

  return {
    ...transform,
    x: transform.x + point.clientX - draggingNodeRect.left - draggingNodeRect.width / 2,
    y: transform.y + point.clientY - draggingNodeRect.top - draggingNodeRect.height / 2
  };
}

function DraggableTask({ task, children, delay }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
    data: { status: task.status }
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban__draggable ${isDragging ? 'is-dragging' : ''}`}
      style={{ animationDelay: delay }}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function KanbanColumn({ column, tasks, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.key,
    data: { status: column.key }
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban__col ${isOver ? 'is-over' : ''}`}
      style={{ '--col-color': column.color }}
    >
      <div className="kanban__col-header">
        <span className="col-label">{column.label}</span>
        <span className="col-count mono">{tasks.length}</span>
      </div>
      <div className="kanban__cards">
        {tasks.length === 0 ? <div className="kanban__empty">Drop tasks here</div> : children}
      </div>
    </div>
  );
}

export default function KanbanView({ tasks, onEdit, onDelete, onStatusChange }) {
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const grouped = useMemo(() => COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {}), [tasks]);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(task => task._id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const nextStatus = over.data.current?.status || over.id;
    const currentStatus = active.data.current?.status;
    if (nextStatus && currentStatus && nextStatus !== currentStatus) {
      onStatusChange(active.id, nextStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveTask(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban">
        {COLUMNS.map(col => (
          <KanbanColumn key={col.key} column={col} tasks={grouped[col.key]}>
            {grouped[col.key].map((task, i) => (
              <DraggableTask key={task._id} task={task} delay={`${i * 40}ms`}>
                <TaskCard
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              </DraggableTask>
            ))}
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay dropAnimation={null} modifiers={[centerOverlayOnCursor]}>
        {activeTask ? (
          <div className="kanban__overlay">
            <TaskCard
              task={activeTask}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
