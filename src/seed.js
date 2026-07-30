require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const {
  User, Driver, Customer, Address, Order, Business, Zone,
  DeliveryAssignment, TrackingEvent, Earning, Rating, Notification,
  Setting, Role,
} = require('./models');

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(), Driver.deleteMany(), Customer.deleteMany(),
    Address.deleteMany(), Order.deleteMany(), Business.deleteMany(),
    Zone.deleteMany(), DeliveryAssignment.deleteMany(),
    TrackingEvent.deleteMany(), Earning.deleteMany(),
    Rating.deleteMany(), Notification.deleteMany(),
    Setting.deleteMany(), Role.deleteMany(),
  ]);

  const hash = await bcrypt.hash('password123', 12);

  // ── Users ──
  const [admin, dispatcher, driverUser, customerUser, customerUser2] = await User.create([
    { name: 'Admin User', email: 'admin@dispatcher.com', phone: '+1-555-0100', passwordHash: hash, role: 'admin' },
    { name: 'Dispatcher One', email: 'dispatcher@dispatcher.com', phone: '+1-555-0101', passwordHash: hash, role: 'dispatcher' },
    { name: 'Driver Ali', email: 'ali@driver.com', phone: '+1-555-0102', passwordHash: hash, role: 'driver' },
    { name: 'Customer Sara', email: 'sara@customer.com', phone: '+1-555-0103', passwordHash: hash, role: 'customer' },
    { name: 'Customer Bilal', email: 'bilal@customer.com', phone: '+1-555-0104', passwordHash: hash, role: 'customer' },
  ]);
  console.log(`Created ${5} users`);

  // ── Drivers ──
  const [driver] = await Driver.create([{
    userId: driverUser._id,
    vehicle: { type: 'car', plate: 'ABC-1234', model: 'Toyota Corolla 2022', color: 'White' },
    license: { number: 'DL-987654', expiryAt: new Date('2027-12-31'), docUrl: 'https://storage.example.com/licenses/dl-987654.pdf' },
    status: 'online',
    currentLocation: { type: 'Point', coordinates: [74.3436, 31.5204] },
    lastLocationAt: new Date(),
    rating: 4.8,
    totalDeliveries: 156,
    earningsBalance: 2450.00,
    isVerified: true,
  }]);
  console.log('Created 1 driver');

  // ── Customers ──
  const [customer] = await Customer.create([
    { userId: customerUser._id, savedAddresses: [] },
    { userId: customerUser2._id, savedAddresses: [] },
  ]);
  console.log('Created 2 customers');

  // ── Addresses ──
  const addresses = await Address.create([
    { ownerId: customerUser._id, label: 'Home', line1: '12-A Canal Road', city: 'Lahore', state: 'Punjab', postalCode: '54000', country: 'PK', location: { type: 'Point', coordinates: [74.3296, 31.4598] }, contactName: 'Sara', contactPhone: '+1-555-0103' },
    { ownerId: customerUser._id, label: 'Office', line1: '45 Mall Road', city: 'Lahore', state: 'Punjab', postalCode: '54001', country: 'PK', location: { type: 'Point', coordinates: [74.3354, 31.5623] }, contactName: 'Sara Work', contactPhone: '+1-555-0103' },
    { ownerId: customerUser2._id, label: 'Home', line1: '78 Gulberg', city: 'Lahore', state: 'Punjab', postalCode: '54660', country: 'PK', location: { type: 'Point', coordinates: [74.3667, 31.5204] }, contactName: 'Bilal', contactPhone: '+1-555-0104' },
    { ownerId: customerUser2._id, label: 'Warehouse', line1: 'Sundar Industrial Estate', city: 'Lahore', state: 'Punjab', postalCode: '54000', country: 'PK', location: { type: 'Point', coordinates: [74.2504, 31.3284] }, contactName: 'Bilal Warehouse', contactPhone: '+1-555-0104' },
  ]);

  customer.savedAddresses = [addresses[0]._id, addresses[1]._id];
  await customer.save();

  // ── Businesses ──
  const [business] = await Business.create([{
    name: 'Pizza Hut Gulberg',
    ownerUserId: admin._id,
    phone: '+1-555-0200',
    email: 'gulberg@pizzahut.com',
    addressId: addresses[2]._id,
    isActive: true,
  }]);
  console.log('Created 1 business');

  // ── Orders ──
  const now = new Date();
  const orders = await Order.create([
    {
      orderNumber: 'ORD-1001', customerId: customerUser._id, businessId: business._id,
      pickup: { addressId: addresses[3]._id, contactName: 'Bilal Warehouse', contactPhone: '+1-555-0104', location: { type: 'Point', coordinates: [74.2504, 31.3284] } },
      dropoff: { addressId: addresses[0]._id, contactName: 'Sara', contactPhone: '+1-555-0103', location: { type: 'Point', coordinates: [74.3296, 31.4598] } },
      items: [{ name: 'Margherita Pizza', qty: 2, weightKg: 0.5 }, { name: 'Garlic Bread', qty: 1, weightKg: 0.3 }],
      packageSize: 'medium', codAmount: 0, status: 'delivered', priority: 'normal',
      pricing: { base: 200, distanceFee: 50, surge: 0, tip: 30, total: 280, currency: 'PKR' },
      distanceKm: 5.2, estimatedDurationMin: 20, assignedDriverId: driver._id, assignedAt: now, deliveredAt: new Date(now - 3600000),
    },
    {
      orderNumber: 'ORD-1002', customerId: customerUser._id, businessId: business._id,
      pickup: { addressId: addresses[3]._id, contactName: 'Bilal Warehouse', contactPhone: '+1-555-0104', location: { type: 'Point', coordinates: [74.2504, 31.3284] } },
      dropoff: { addressId: addresses[1]._id, contactName: 'Sara Work', contactPhone: '+1-555-0103', location: { type: 'Point', coordinates: [74.3354, 31.5623] } },
      items: [{ name: 'Chicken Tikka', qty: 3, weightKg: 1.2, notes: 'Extra spicy' }],
      packageSize: 'medium', codAmount: 150, status: 'in_transit', priority: 'express',
      pricing: { base: 300, distanceFee: 80, surge: 50, tip: 0, total: 430, currency: 'PKR' },
      distanceKm: 8.7, estimatedDurationMin: 25, etaAt: new Date(now + 900000), assignedDriverId: driver._id, assignedAt: now,
    },
    {
      orderNumber: 'ORD-1003', customerId: customerUser2._id, businessId: business._id,
      pickup: { addressId: addresses[3]._id, contactName: 'Bilal Warehouse', contactPhone: '+1-555-0104', location: { type: 'Point', coordinates: [74.2504, 31.3284] } },
      dropoff: { addressId: addresses[2]._id, contactName: 'Bilal', contactPhone: '+1-555-0104', location: { type: 'Point', coordinates: [74.3667, 31.5204] } },
      items: [{ name: 'Zinger Burger', qty: 4, weightKg: 0.8 }],
      packageSize: 'small', codAmount: 200, status: 'pending', priority: 'normal',
      pricing: { base: 400, distanceFee: 60, surge: 0, tip: 0, total: 460, currency: 'PKR' },
      distanceKm: 6.5, estimatedDurationMin: 18,
    },
  ]);
  console.log(`Created ${orders.length} orders`);

  // ── Delivery Assignments ──
  await DeliveryAssignment.create([
    { orderId: orders[0]._id, driverId: driver._id, offeredAt: new Date(now - 7200000), respondedAt: new Date(now - 7100000), response: 'accepted' },
    { orderId: orders[1]._id, driverId: driver._id, offeredAt: new Date(now - 3600000), respondedAt: new Date(now - 3500000), response: 'accepted' },
  ]);
  console.log('Created delivery assignments');

  // ── Tracking Events ──
  await TrackingEvent.create([
    { orderId: orders[0]._id, driverId: driver._id, status: 'assigned', location: { type: 'Point', coordinates: [74.2504, 31.3284] }, createdAt: new Date(now - 7200000) },
    { orderId: orders[0]._id, driverId: driver._id, status: 'picked_up', location: { type: 'Point', coordinates: [74.2504, 31.3284] }, createdAt: new Date(now - 7000000) },
    { orderId: orders[0]._id, driverId: driver._id, status: 'delivered', location: { type: 'Point', coordinates: [74.3296, 31.4598] }, note: 'Left at reception', createdAt: new Date(now - 6800000) },
    { orderId: orders[1]._id, driverId: driver._id, status: 'assigned', location: { type: 'Point', coordinates: [74.2504, 31.3284] }, createdAt: new Date(now - 3600000) },
    { orderId: orders[1]._id, driverId: driver._id, status: 'picked_up', location: { type: 'Point', coordinates: [74.2504, 31.3284] }, createdAt: new Date(now - 3400000) },
  ]);
  console.log('Created tracking events');

  // ── Earnings ──
  await Earning.create([
    { driverId: driver._id, orderId: orders[0]._id, type: 'delivery', amount: 250, currency: 'PKR', status: 'paid' },
    { driverId: driver._id, orderId: orders[0]._id, type: 'tip', amount: 30, currency: 'PKR', status: 'paid' },
    { driverId: driver._id, orderId: orders[1]._id, type: 'delivery', amount: 380, currency: 'PKR', status: 'pending' },
  ]);
  console.log('Created earnings');

  // ── Ratings ──
  await Rating.create([
    { orderId: orders[0]._id, raterId: customerUser._id, rateeId: driverUser._id, role: 'driver', stars: 5, comment: 'Fast and careful delivery!' },
  ]);
  console.log('Created ratings');

  // ── Zones ──
  await Zone.create([
    {
      name: 'Lahore Central', isActive: true,
      polygon: { type: 'Polygon', coordinates: [[[74.2504, 31.3284], [74.2504, 31.5623], [74.4000, 31.5623], [74.4000, 31.3284], [74.2504, 31.3284]]] },
      baseFare: 100, perKmRate: 15, surgeMultiplier: 1.5,
    },
    {
      name: 'Lahore North', isActive: true,
      polygon: { type: 'Polygon', coordinates: [[[74.3000, 31.5623], [74.3000, 31.6500], [74.4500, 31.6500], [74.4500, 31.5623], [74.3000, 31.5623]]] },
      baseFare: 150, perKmRate: 20, surgeMultiplier: 1.2,
    },
  ]);
  console.log('Created 2 zones');

  // ── Notifications ──
  await Notification.create([
    { userId: driverUser._id, type: 'order_assigned', title: 'New Order', body: 'ORD-1002 has been assigned to you' },
    { userId: customerUser._id, type: 'order_delivered', title: 'Delivered!', body: 'Your order ORD-1001 has been delivered' },
  ]);
  console.log('Created 2 notifications');

  // ── Default Roles ──
  await Role.create([
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Full system access',
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'drivers.create', 'drivers.read', 'drivers.update', 'drivers.delete',
        'customers.create', 'customers.read', 'customers.update', 'customers.delete',
        'orders.create', 'orders.read', 'orders.update', 'orders.delete',
        'settings.manage', 'roles.manage', 'analytics.view',
      ],
      isSystem: true,
      isActive: true,
    },
    {
      name: 'Dispatcher',
      slug: 'dispatcher',
      description: 'Manage orders and drivers',
      permissions: [
        'drivers.read', 'drivers.update',
        'customers.create', 'customers.read', 'customers.update',
        'orders.create', 'orders.read', 'orders.update', 'orders.delete',
        'analytics.view',
      ],
      isSystem: true,
      isActive: true,
    },
    {
      name: 'Driver',
      slug: 'driver',
      description: 'Driver mobile app access',
      permissions: [
        'orders.read', 'orders.update',
        'profile.update',
      ],
      isSystem: true,
      isActive: true,
    },
    {
      name: 'Customer',
      slug: 'customer',
      description: 'Customer mobile app access',
      permissions: [
        'orders.create', 'orders.read',
        'profile.update',
      ],
      isSystem: true,
      isActive: true,
    },
  ]);
  console.log('Created 4 default roles');

  // ── Default Settings ──
  await Setting.create([
    { key: 'general_APP_NAME', value: 'Dispatcher Dashboard', category: 'general', description: 'Application Name' },
    { key: 'general_TIMEZONE', value: 'UTC', category: 'general', description: 'Default Timezone' },
  ]);
  console.log('Created default settings');

  console.log('\nSeed complete!');
  console.log('Login emails: admin@dispatcher.com, ali@driver.com, sara@customer.com');
  console.log('Password for all: password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
