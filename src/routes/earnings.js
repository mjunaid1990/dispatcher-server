const express = require('express');
const router = express.Router();
const { Earning, Payout } = require('../models');

// ── Earnings ──

const earningPopulates = [
  { path: 'driverId', populate: { path: 'userId', select: '-passwordHash' } },
  { path: 'orderId' },
  { path: 'payoutId' },
];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.driverId) filter.driverId = req.query.driverId;
    if (req.query.status) filter.status = req.query.status;
    const items = await Earning.find(filter).populate(earningPopulates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Earning.findById(req.params.id).populate(earningPopulates);
    if (!item) return res.status(404).json({ message: 'Earning not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await Earning.create(req.body);
    const populated = await Earning.findById(item._id).populate(earningPopulates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Earning.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(earningPopulates);
    if (!item) return res.status(404).json({ message: 'Earning not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await Earning.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Earning not found' });
    res.json({ message: 'Earning deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Payouts ──

const payoutPopulates = [
  { path: 'driverId', populate: { path: 'userId', select: '-passwordHash' } },
];

router.get('/payouts', async (req, res) => {
  try {
    const filter = {};
    if (req.query.driverId) filter.driverId = req.query.driverId;
    if (req.query.status) filter.status = req.query.status;
    const items = await Payout.find(filter).populate(payoutPopulates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/payouts/:id', async (req, res) => {
  try {
    const item = await Payout.findById(req.params.id).populate(payoutPopulates);
    if (!item) return res.status(404).json({ message: 'Payout not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/payouts', async (req, res) => {
  try {
    const item = await Payout.create(req.body);
    const populated = await Payout.findById(item._id).populate(payoutPopulates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/payouts/:id', async (req, res) => {
  try {
    const item = await Payout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(payoutPopulates);
    if (!item) return res.status(404).json({ message: 'Payout not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/payouts/:id', async (req, res) => {
  try {
    const item = await Payout.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Payout not found' });
    res.json({ message: 'Payout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
