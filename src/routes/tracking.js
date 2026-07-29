const express = require('express');
const router = express.Router();
const { TrackingEvent, LocationPing, ProofOfDelivery } = require('../models');

// ── Tracking Events ──

const eventPopulates = [
  { path: 'orderId' },
  { path: 'driverId', populate: { path: 'userId', select: '-passwordHash' } },
];

router.get('/events', async (req, res) => {
  try {
    const filter = {};
    if (req.query.orderId) filter.orderId = req.query.orderId;
    const items = await TrackingEvent.find(filter).populate(eventPopulates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/events', async (req, res) => {
  try {
    const item = await TrackingEvent.create(req.body);
    const populated = await TrackingEvent.findById(item._id).populate(eventPopulates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Location Pings ──

router.get('/pings', async (req, res) => {
  try {
    const filter = {};
    if (req.query.driverId) filter.driverId = req.query.driverId;
    const items = await LocationPing.find(filter)
      .populate('driverId')
      .sort({ recordedAt: -1 })
      .limit(parseInt(req.query.limit) || 100);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/pings', async (req, res) => {
  try {
    const item = await LocationPing.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Proof of Delivery ──

const podPopulates = [
  { path: 'orderId' },
  { path: 'driverId', populate: { path: 'userId', select: '-passwordHash' } },
];

router.get('/proofs', async (req, res) => {
  try {
    const filter = {};
    if (req.query.orderId) filter.orderId = req.query.orderId;
    const items = await ProofOfDelivery.find(filter).populate(podPopulates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/proofs/:id', async (req, res) => {
  try {
    const item = await ProofOfDelivery.findById(req.params.id).populate(podPopulates);
    if (!item) return res.status(404).json({ message: 'Proof of delivery not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/proofs', async (req, res) => {
  try {
    const item = await ProofOfDelivery.create(req.body);
    const populated = await ProofOfDelivery.findById(item._id).populate(podPopulates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/proofs/:id', async (req, res) => {
  try {
    const item = await ProofOfDelivery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(podPopulates);
    if (!item) return res.status(404).json({ message: 'Proof of delivery not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/proofs/:id', async (req, res) => {
  try {
    const item = await ProofOfDelivery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Proof of delivery not found' });
    res.json({ message: 'Proof of delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
