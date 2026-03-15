const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.get('/', async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.json(contact || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const existing = await Contact.findOne();
    if (existing) {
      const updated = await Contact.findByIdAndUpdate(existing._id, req.body, { new: true });
      res.json(updated);
    } else {
      const newDoc = new Contact(req.body);
      const saved = await newDoc.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
