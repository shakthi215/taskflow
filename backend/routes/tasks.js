const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().toDate(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('tags').optional().isArray()
];

router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const sort = {};
    sort[req.query.sortBy || 'dueDate'] = req.query.order === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter).sort(sort);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const user = req.user._id;
    const [total, todo, inProgress, completed, overdue] = await Promise.all([
      Task.countDocuments({ user }),
      Task.countDocuments({ user, status: 'todo' }),
      Task.countDocuments({ user, status: 'in-progress' }),
      Task.countDocuments({ user, status: 'completed' }),
      Task.countDocuments({ user, dueDate: { $lt: new Date() }, status: { $ne: 'completed' } })
    ]);
    res.json({ success: true, data: { total, todo, inProgress, completed, overdue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', param('id').isMongoId(), handleValidation, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', taskValidation, handleValidation, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', param('id').isMongoId(), taskValidation, handleValidation, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch(
  '/:id/status',
  param('id').isMongoId(),
  body('status').isIn(['todo', 'in-progress', 'completed']),
  handleValidation,
  async (req, res) => {
    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { status: req.body.status },
        { new: true }
      );
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.delete('/:id', param('id').isMongoId(), handleValidation, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
