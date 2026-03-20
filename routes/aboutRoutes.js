const express = require('express');
const router = express.Router();
const About = require('../models/About');

const VALID_CATEGORIES = new Set(['headline', 'body', 'note']);

const normalizeBlocks = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const text = String(item?.text || '').trim();
      const category = VALID_CATEGORIES.has(item?.category) ? item.category : 'body';
      return text ? { category, text } : null;
    })
    .filter(Boolean);
};

const buildBioFromBlocks = (blocks) => blocks.map((b) => b.text).join('\n');

const normalizeAboutPayload = (body = {}) => {
  const aboutBlocks = normalizeBlocks(body.aboutBlocks);
  const bioFromBlocks = aboutBlocks.length ? buildBioFromBlocks(aboutBlocks) : '';
  const rawBio = String(body.bio || '').trim();
  const bio = bioFromBlocks || rawBio;
  return { bio, aboutBlocks };
};

// Get about (single doc)
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about || { bio: '', aboutBlocks: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upsert about
router.put('/', async (req, res) => {
  try {
    const payload = normalizeAboutPayload(req.body);
    const existing = await About.findOne();
    if (existing) {
      const updated = await About.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true });
      res.json(updated);
    } else {
      const newAbout = new About(payload);
      const saved = await newAbout.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
