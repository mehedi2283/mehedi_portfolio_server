const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Initialize settings if they don't exist
const initSettings = async () => {
  const count = await Settings.countDocuments();
  if (count === 0) {
    await Settings.create({ passkey1: '1358549', passkey2: '2283' });
    console.log('Default settings initialized');
  }
};
initSettings();

// GET current settings (public for verification logic, but values hidden in real apps - here we expose for simplicity as requested)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne() || { passkey1: '1358549', passkey2: '2283' };
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST verify stage 1
router.post('/verify/1', async (req, res) => {
  try {
    const { passkey } = req.body;
    const settings = await Settings.findOne();
    if (settings && settings.passkey1 === passkey) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Invalid passkey' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST verify stage 2
router.post('/verify/2', async (req, res) => {
  try {
    const { passkey } = req.body;
    const settings = await Settings.findOne();
    if (settings && settings.passkey2 === passkey) {
      return res.json({ success: true });
    }
    res.status(401).json({ success: false, message: 'Invalid passkey' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const { passkey1, passkey2 } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ passkey1, passkey2 });
    } else {
      settings.passkey1 = passkey1 || settings.passkey1;
      settings.passkey2 = passkey2 || settings.passkey2;
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
