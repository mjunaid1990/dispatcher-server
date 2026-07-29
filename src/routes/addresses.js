const express = require('express');
const router = express.Router();
const { Address } = require('../models');

const populates = [{ path: 'ownerId', select: '-passwordHash' }];

router.get('/', async (req, res) => {
  try {
    const filter = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    const items = await Address.find(filter).populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Address.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Address not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Address.create(req.body);
    const populated = await Address.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Address not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Address.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
