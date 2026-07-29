const express = require('express');
const router = express.Router();
const { Business } = require('../models');

const populates = [
  { path: 'ownerUserId', select: '-passwordHash' },
  { path: 'addressId' },
];

router.get('/', async (req, res) => {
  try {
    const items = await Business.find().populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Business.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Business not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Business.create(req.body);
    const populated = await Business.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Business not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Business.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Business not found' });
    res.json({ message: 'Business deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
