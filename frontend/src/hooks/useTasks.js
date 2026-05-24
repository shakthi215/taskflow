import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

export function useTasks(filters = {}, enabled = true) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!enabled) {
      setTasks([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        taskAPI.getAll(filters),
        taskAPI.getStats()
      ]);
      setTasks(tasksRes.data.data);
      setStats(statsRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters), enabled]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (data) => {
    const toastId = toast.loading('Creating task...');
    try {
      const res = await taskAPI.create(data);
      setTasks(prev => [res.data.data, ...prev]);
      toast.success('Task created!', { id: toastId });
      fetchTasks(); // refresh stats
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task', { id: toastId });
      throw err;
    }
  };

  const updateTask = async (id, data) => {
    const toastId = toast.loading('Updating...');
    try {
      const res = await taskAPI.update(id, data);
      setTasks(prev => prev.map(t => t._id === id ? res.data.data : t));
      toast.success('Task updated!', { id: toastId });
      fetchTasks();
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task', { id: toastId });
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await taskAPI.updateStatus(id, status);
      setTasks(prev => prev.map(t => t._id === id ? res.data.data : t));
      toast.success(`Moved to ${status.replace('-', ' ')}`);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteTask = async (id) => {
    const toastId = toast.loading('Deleting...');
    try {
      await taskAPI.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted', { id: toastId });
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task', { id: toastId });
    }
  };

  return { tasks, stats, loading, error, createTask, updateTask, updateStatus, deleteTask, refetch: fetchTasks };
}
