const express = require('express');
const router = express.Router();
const { Zone } = require('../models');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const items = await Zone.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Zone.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Zone not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Zone.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Zone not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Zone.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Zone not found' });
    res.json({ message: 'Zone deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
