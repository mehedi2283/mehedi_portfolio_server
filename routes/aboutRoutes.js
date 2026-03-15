const express = require('express');
const router = express.Router();
const About = require('../models/About');

// Get about (single doc)
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about || { bio: '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upsert about
router.put('/', async (req, res) => {
  try {
    const existing = await About.findOne();
    if (existing) {
      const updated = await About.findByIdAndUpdate(existing._id, req.body, { new: true });
      res.json(updated);
    } else {
      const newAbout = new About(req.body);
      const saved = await newAbout.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
