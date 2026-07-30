require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const userRoutes = require('./routes/users');
const driverRoutes = require('./routes/drivers');
const customerRoutes = require('./routes/customers');
const addressRoutes = require('./routes/addresses');
const orderRoutes = require('./routes/orders');
const businessRoutes = require('./routes/businesses');
const assignmentRoutes = require('./routes/assignments');
const trackingRoutes = require('./routes/tracking');
const earningRoutes = require('./routes/earnings');
const deliveryRouteRoutes = require('./routes/delivery-routes');
const ratingRoutes = require('./routes/ratings');
const notificationRoutes = require('./routes/notifications');
const ticketRoutes = require('./routes/tickets');
const zoneRoutes = require('./routes/zones');
const seedRoutes = require('./routes/seed');
const settingsRoutes = require('./routes/settings');
const roleRoutes = require('./routes/roles');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Dispatcher Server API' });
});

app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/delivery-routes', deliveryRouteRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/roles', roleRoutes);

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ status: 'ok', db: states[dbState] });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
