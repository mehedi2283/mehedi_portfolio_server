const express = require('express');
const router = express.Router();
const Landing = require('../models/Landing');

router.get('/', async (req, res) => {
  try {
    const landing = await Landing.findOne();
    res.json(landing || { firstName: 'MEHEDI', lastName: 'HASAN', role1: 'Specialist', role2: 'Engineer' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const existing = await Landing.findOne();
    if (existing) {
      const updated = await Landing.findByIdAndUpdate(existing._id, req.body, { new: true });
      res.json(updated);
    } else {
      const newDoc = new Landing(req.body);
      const saved = await newDoc.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
