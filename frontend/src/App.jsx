import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTasks } from './hooks/useTasks';
import { authAPI, setAuthToken } from './utils/api';
import AuthPage from './components/AuthPage';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import TaskModal from './components/TaskModal';
import KanbanView from './components/KanbanView';
import ListView from './components/ListView';
import './styles/globals.css';
import './App.css';

export default function App() {
  const [filters, setFilters] = useState({ status: '', priority: '', sortBy: 'dueDate', order: 'asc' });
  const [view, setView] = useState('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('taskflow-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('taskflow-token');
    if (!token) {
      setAuthReady(true);
      return;
    }

    setAuthToken(token);
    authAPI.me()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('taskflow-token');
        setAuthToken(null);
      })
      .finally(() => setAuthReady(true));
  }, []);

  const { tasks, stats, loading, createTask, updateTask, updateStatus, deleteTask } = useTasks(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
    Boolean(user)
  );

  const handleAuth = ({ token, user: nextUser }) => {
    localStorage.setItem('taskflow-token', token);
    setAuthToken(token);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('taskflow-token');
    setAuthToken(null);
    setUser(null);
    setFilters({ status: '', priority: '', sortBy: 'dueDate', order: 'asc' });
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };
  const handleSave = (data) => editingTask ? updateTask(editingTask._id, data) : createTask(data);
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');

  const toaster = (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-light)' },
        success: { iconTheme: { primary: 'var(--done)', secondary: 'transparent' } },
        error: { iconTheme: { primary: 'var(--danger)', secondary: 'transparent' } }
      }}
    />
  );

  if (!authReady) {
    return (
      <div className="app app--loading">
        {toaster}
        <div className="skeleton" style={{ width: 240, height: 18 }} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {toaster}
        <AuthPage onAuth={handleAuth} theme={theme} onThemeToggle={toggleTheme} />
      </>
    );
  }

  return (
    <div className="app">
      {toaster}

      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">TF</div>
          <div>
            <h1 className="brand-name">TaskFlow</h1>
            <span className="brand-sub">task management</span>
          </div>
        </div>

        <div className="header-right">
          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              List
            </button>
            <button
              className={`view-btn ${view === 'kanban' ? 'active' : ''}`}
              onClick={() => setView('kanban')}
              title="Board view"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="11" rx="1" />
              </svg>
              Board
            </button>
          </div>

          <button className="theme-switch" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button className="logout-btn" onClick={logout} title={`Signed in as ${user.email}`}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="section">
          <StatsBar stats={stats} />
        </section>

        <section className="section">
          <FilterBar filters={filters} onChange={setFilters} onAdd={openCreate} />
        </section>

        <section className="section tasks-section">
          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 160, animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : view === 'kanban' ? (
            <KanbanView
              tasks={tasks}
              onEdit={openEdit}
              onDelete={deleteTask}
              onStatusChange={updateStatus}
            />
          ) : (
            <ListView
              tasks={tasks}
              onEdit={openEdit}
              onDelete={deleteTask}
              onStatusChange={updateStatus}
            />
          )}
        </section>
      </main>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
