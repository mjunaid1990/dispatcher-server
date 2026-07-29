const express = require('express');
const router = express.Router();
const { Notification } = require('../models');

const populates = [{ path: 'userId', select: '-passwordHash' }];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    const items = await Notification.find(filter).populate(populates).sort({ sentAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Notification.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Notification.create(req.body);
    const populated = await Notification.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Notification.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
