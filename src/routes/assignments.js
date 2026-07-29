const express = require('express');
const router = express.Router();
const { DeliveryAssignment } = require('../models');

const populates = [
  { path: 'orderId' },
  { path: 'driverId', populate: { path: 'userId', select: '-passwordHash' } },
];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.orderId) filter.orderId = req.query.orderId;
    if (req.query.driverId) filter.driverId = req.query.driverId;
    const items = await DeliveryAssignment.find(filter).populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await DeliveryAssignment.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Assignment not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await DeliveryAssignment.create(req.body);
    const populated = await DeliveryAssignment.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await DeliveryAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Assignment not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await DeliveryAssignment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
