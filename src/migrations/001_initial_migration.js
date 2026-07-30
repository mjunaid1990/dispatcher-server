require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Migration 001: Initial setup for Setting and Role collections
 * This migration creates the new tables and alters existing ones if needed
 */

async function up() {
  await connectDB();
  console.log('Running migration 001...');

  const db = mongoose.connection.db;

  // Create Setting collection with indexes
  const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, enum: ['smtp', 'sms', 'push', 'general', 'role'], default: 'general' },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now },
  }, { timestamps: true });

  // Create indexes
  settingSchema.index({ key: 1 });
  settingSchema.index({ category: 1 });

  const Setting = mongoose.model('Setting', settingSchema);
  await Setting.createIndexes();
  console.log('✓ Setting collection created with indexes');

  // Create Role collection with indexes
  const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  roleSchema.index({ name: 1 });
  roleSchema.index({ slug: 1 });
  roleSchema.index({ isActive: 1 });

  const Role = mongoose.model('Role', roleSchema);
  await Role.createIndexes();
  console.log('✓ Role collection created with indexes');

  // Seed default system roles
  const defaultRoles = [
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
  ];

  await Role.insertMany(defaultRoles);
  console.log('✓ Default system roles seeded');

  // Alter User collection - ensure role field has proper index
  const userCollection = db.collection('users');
  const userIndexes = await userCollection.indexes();
  const hasRoleIndex = userIndexes.some(idx => idx.key && idx.key.role === 1);

  if (!hasRoleIndex) {
    await userCollection.createIndex({ role: 1 });
    console.log('✓ Added role index to users collection');
  }

  // Alter Order collection - add geo indexes if not present
  const orderCollection = db.collection('orders');
  const orderIndexes = await orderCollection.indexes();
  const hasPickupGeo = orderIndexes.some(idx => idx.key && idx.key['pickup.location'] === '2dsphere');
  const hasDropoffGeo = orderIndexes.some(idx => idx.key && idx.key['dropoff.location'] === '2dsphere');

  if (!hasPickupGeo) {
    await orderCollection.createIndex({ 'pickup.location': '2dsphere' });
    console.log('✓ Added pickup.location 2dsphere index to orders collection');
  }

  if (!hasDropoffGeo) {
    await orderCollection.createIndex({ 'dropoff.location': '2dsphere' });
    console.log('✓ Added dropoff.location 2dsphere index to orders collection');
  }

  // Alter Driver collection - ensure location index
  const driverCollection = db.collection('drivers');
  const driverIndexes = await driverCollection.indexes();
  const hasDriverLocation = driverIndexes.some(idx => idx.key && idx.key.currentLocation === '2dsphere');

  if (!hasDriverLocation) {
    await driverCollection.createIndex({ currentLocation: '2dsphere' });
    console.log('✓ Added currentLocation 2dsphere index to drivers collection');
  }

  // Create migrations collection to track this migration
  const migrationsCollection = db.collection('migrations');
  await migrationsCollection.insertOne({
    name: '001_initial_migration',
    executedAt: new Date(),
  });

  console.log('Migration 001 completed successfully!');
  process.exit(0);
}

async function down() {
  await connectDB();
  console.log('Rolling back migration 001...');

  const db = mongoose.connection.db;

  // Drop collections
  await db.dropCollection('settings').catch(() => console.log('Settings collection not found or already dropped'));
  console.log('✓ Dropped settings collection');

  await db.dropCollection('roles').catch(() => console.log('Roles collection not found or already dropped'));
  console.log('✓ Dropped roles collection');

  // Remove migration record
  const migrationsCollection = db.collection('migrations');
  await migrationsCollection.deleteOne({ name: '001_initial_migration' });
  console.log('✓ Removed migration record');

  console.log('Migration 001 rollback completed!');
  process.exit(0);
}

// Run migration
const command = process.argv[2];

if (command === 'down') {
  down().catch((err) => {
    console.error('Migration rollback failed:', err);
    process.exit(1);
  });
} else {
  up().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
