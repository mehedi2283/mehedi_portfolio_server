const express = require('express');
const router = express.Router();
const Career = require('../models/Career');

// Get all career entries
router.get('/', async (req, res) => {
  try {
    const careers = await Career.find().sort({ order: 1, createdAt: -1 });
    res.json(careers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new career entry
router.post('/', async (req, res) => {
  const career = new Career(req.body);
  try {
    const newCareer = await career.save();
    res.status(201).json(newCareer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a career entry
router.put('/:id', async (req, res) => {
  try {
    const updatedCareer = await Career.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCareer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a career entry
router.delete('/:id', async (req, res) => {
  try {
    await Career.findByIdAndDelete(req.params.id);
    res.json({ message: 'Career entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
