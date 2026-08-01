const express = require('express');
const router = express.Router();
const { Order, Driver } = require('../models');
const { authenticate } = require('../middleware/auth');
const { sendNotificationToUser } = require('../services/notificationService');

const populates = [
  { path: 'customerId', select: '-passwordHash' },
  { path: 'businessId' },
  { path: 'assignedDriverId', populate: { path: 'userId', select: '-passwordHash' } },
];

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.driverId) filter.assignedDriverId = req.query.driverId;
    const items = await Order.find(filter).populate(populates).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Order.findById(req.params.id).populate(populates);
    if (!item) return res.status(404).json({ message: 'Order not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const item = await Order.create(req.body);
    const populated = await Order.findById(item._id).populate(populates);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const previousOrder = await Order.findById(req.params.id);
    const item = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populates);
    if (!item) return res.status(404).json({ message: 'Order not found' });

    // Trigger Notification for Driver Assignment
    if (req.body.assignedDriverId && (!previousOrder || previousOrder.assignedDriverId?.toString() !== req.body.assignedDriverId.toString())) {
      try {
        const driverDoc = await Driver.findById(req.body.assignedDriverId);
        if (driverDoc && driverDoc.userId) {
          await sendNotificationToUser({
            userId: driverDoc.userId,
            type: 'order_assigned',
            title: 'New Delivery Request',
            body: `You have been assigned order #${item.orderNumber || item._id.toString().slice(-6)}.`,
            data: { orderId: item._id.toString() },
          });
        }
      } catch (err) {
        console.error('Error notifying driver:', err.message);
      }
    }

    // Trigger Notification for Customer on Status Change
    if (req.body.status && previousOrder && previousOrder.status !== req.body.status) {
      try {
        if (item.customerId) {
          const customerUserId = item.customerId._id || item.customerId;
          const statusLabels = {
            accepted: 'accepted by your driver',
            picked_up: 'picked up by driver',
            in_transit: 'on the way to your address',
            delivered: 'delivered successfully!',
            failed: 'delivery attempt failed',
          };
          const statusText = statusLabels[req.body.status] || req.body.status;

          await sendNotificationToUser({
            userId: customerUserId,
            type: 'order_status_update',
            title: `Order Update`,
            body: `Your order #${item.orderNumber || item._id.toString().slice(-6)} is now ${statusText}.`,
            data: { orderId: item._id.toString(), status: req.body.status },
          });
        }
      } catch (err) {
        console.error('Error notifying customer:', err.message);
      }
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Order.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
