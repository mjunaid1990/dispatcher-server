const express = require('express');
const router = express.Router();
const { Setting } = require('../models');
const fs = require('fs');
const path = require('path');

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.find({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get settings by category
router.get('/category/:category', async (req, res) => {
  try {
    const settings = await Setting.find({ category: req.params.category });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save settings (bulk update)
router.post('/', async (req, res) => {
  try {
    const { smtp, sms, push, general, role } = req.body;

    const operations = [];

    // Process SMTP settings
    if (smtp) {
      Object.entries(smtp).forEach(([key, value]) => {
        operations.push({
          updateOne: {
            filter: { key: `smtp_${key}` },
            update: { 
              value, 
              category: 'smtp',
              description: `SMTP ${key}`,
              updatedAt: new Date()
            },
            upsert: true
          }
        });
      });
    }

    // Process SMS settings
    if (sms) {
      Object.entries(sms).forEach(([key, value]) => {
        operations.push({
          updateOne: {
            filter: { key: `sms_${key}` },
            update: { 
              value, 
              category: 'sms',
              description: `SMS ${key}`,
              updatedAt: new Date()
            },
            upsert: true
          }
        });
      });
    }

    // Process Push settings
    if (push) {
      Object.entries(push).forEach(([key, value]) => {
        operations.push({
          updateOne: {
            filter: { key: `push_${key}` },
            update: { 
              value, 
              category: 'push',
              description: `Push ${key}`,
              updatedAt: new Date()
            },
            upsert: true
          }
        });
      });
    }

    // Process General settings
    if (general) {
      Object.entries(general).forEach(([key, value]) => {
        operations.push({
          updateOne: {
            filter: { key: `general_${key}` },
            update: { 
              value, 
              category: 'general',
              description: `General ${key}`,
              updatedAt: new Date()
            },
            upsert: true
          }
        });
      });
    }

    // Process Role settings
    if (role) {
      Object.entries(role).forEach(([key, value]) => {
        operations.push({
          updateOne: {
            filter: { key: `role_${key}` },
            update: { 
              value, 
              category: 'role',
              description: `Role ${key}`,
              updatedAt: new Date()
            },
            upsert: true
          }
        });
      });
    }

    if (operations.length > 0) {
      await Setting.bulkWrite(operations);
    }

    // Update .env file for critical settings
    await updateEnvFile({ smtp, sms, push, general });

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update single setting
router.put('/:key', async (req, res) => {
  try {
    const { value, category, description } = req.body;
    
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value, category, description, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete setting
router.delete('/:key', async (req, res) => {
  try {
    await Setting.findOneAndDelete({ key: req.params.key });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update .env file
async function updateEnvFile(settings) {
  try {
    const envPath = path.join(__dirname, '../../.env');
    
    if (!fs.existsSync(envPath)) {
      console.warn('.env file not found, skipping update');
      return;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    // Settings to update in .env
    const envUpdates = [];

    if (settings.smtp) {
      envUpdates.push({ key: 'MAIL_HOST', value: settings.smtp.MAIL_HOST });
      envUpdates.push({ key: 'MAIL_PORT', value: settings.smtp.MAIL_PORT });
      envUpdates.push({ key: 'MAIL_USERNAME', value: settings.smtp.MAIL_USERNAME });
      envUpdates.push({ key: 'MAIL_PASSWORD', value: settings.smtp.MAIL_PASSWORD });
      envUpdates.push({ key: 'MAIL_ENCRYPTION', value: settings.smtp.MAIL_ENCRYPTION });
      envUpdates.push({ key: 'MAIL_FROM_ADDRESS', value: settings.smtp.MAIL_FROM_ADDRESS });
      envUpdates.push({ key: 'MAIL_FROM_NAME', value: settings.smtp.MAIL_FROM_NAME });
    }

    if (settings.sms) {
      envUpdates.push({ key: 'SMS_API_KEY', value: settings.sms.SMS_API_KEY });
      envUpdates.push({ key: 'SMS_SENDER_ID', value: settings.sms.SMS_SENDER_ID });
    }

    if (settings.push) {
      envUpdates.push({ key: 'FCM_SERVER_KEY', value: settings.push.FCM_SERVER_KEY });
    }

    if (settings.general) {
      envUpdates.push({ key: 'APP_NAME', value: settings.general.APP_NAME });
      envUpdates.push({ key: 'TIMEZONE', value: settings.general.TIMEZONE });
    }

    // Update or add each setting
    envUpdates.forEach(({ key, value }) => {
      if (value === undefined || value === null || value === '') return;
      
      const envKey = key;
      const envLine = `${envKey}=${value}`;
      
      const existingIndex = lines.findIndex(line => line.startsWith(`${envKey}=`));
      
      if (existingIndex >= 0) {
        lines[existingIndex] = envLine;
      } else {
        lines.push(envLine);
      }
    });

    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('.env file updated successfully');
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

module.exports = router;
