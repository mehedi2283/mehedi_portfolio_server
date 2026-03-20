const express = require('express');
const router = express.Router();
const TechStack = require('../models/TechStack');

router.get('/', async (req, res) => {
  try {
    const items = await TechStack.find();
    const rank = (item) => {
      if (item.category === 'automation' && item.highlighted) return 0;
      if (item.category === 'automation') return 1;
      if (item.category === 'extra' && item.highlighted) return 2;
      return 3;
    };

    items.sort((a, b) => {
      const delta = rank(a) - rank(b);
      if (delta !== 0) return delta;
      return a.name.localeCompare(b.name);
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const item = new TechStack(req.body);
  try {
    const saved = await item.save();
    if (saved.highlighted) {
      await TechStack.updateMany({ _id: { $ne: saved._id } }, { $set: { highlighted: false } });
    }
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.highlighted === true) {
      await TechStack.updateMany({ _id: { $ne: req.params.id } }, { $set: { highlighted: false } });
    }
    const updated = await TechStack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await TechStack.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
