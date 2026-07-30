require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

/**
 * Migration 001: Initial setup for Setting collection
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
    category: { type: String, enum: ['smtp', 'sms', 'push', 'general'], default: 'general' },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now },
  }, { timestamps: true });

  // Create indexes
  settingSchema.index({ key: 1 });
  settingSchema.index({ category: 1 });

  const Setting = mongoose.model('Setting', settingSchema);
  await Setting.createIndexes();
  console.log('✓ Setting collection created with indexes');


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
