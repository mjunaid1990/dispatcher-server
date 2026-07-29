const express = require('express');
const router = express.Router();
const { Rating } = require('../models');

const populates = [
  { path: 'orderId' },
  { path: 'raterId', select: '-passwordHash' },
  { path: 'rateeId', select: '-passwordHash' },
];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.rateeId) filter.rateeId = req.query.rateeId;
    if (req.query.orderId) filter.orderId = req.query.orderId;
    const items = await Rating.find(filter).populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Rating.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Rating not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Rating.create(req.body);
    const populated = await Rating.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Rating not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Rating.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Rating not found' });
    res.json({ message: 'Rating deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
