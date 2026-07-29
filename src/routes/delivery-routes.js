const express = require('express');
const router = express.Router();
const { Route } = require('../models');

const populates = [
  {
    path: 'driverId',
    populate: { path: 'userId', select: '-passwordHash' },
  },
  { path: 'stops.orderId' },
];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.driverId) filter.driverId = req.query.driverId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) filter.date = new Date(req.query.date);
    const items = await Route.find(filter).populate(populates).sort({ date: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Route.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Route not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Route.create(req.body);
    const populated = await Route.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Route not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Route.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
