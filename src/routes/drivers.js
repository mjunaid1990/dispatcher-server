const express = require('express');
const router = express.Router();
const { Driver } = require('../models');

const populates = [{ path: 'userId', select: '-passwordHash' }];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    const items = await Driver.find(filter).populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Driver.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Driver not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Driver.create(req.body);
    const populated = await Driver.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Driver not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Driver.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
