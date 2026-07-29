const express = require('express');
const router = express.Router();
const { SupportTicket } = require('../models');

const populates = [
  { path: 'openedBy', select: '-passwordHash' },
  { path: 'orderId' },
  { path: 'messages.senderId', select: '-passwordHash' },
];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.openedBy) filter.openedBy = req.query.openedBy;
    const items = await SupportTicket.find(filter).populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await SupportTicket.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Ticket not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await SupportTicket.create(req.body);
    const populated = await SupportTicket.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Ticket not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const item = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
