const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const Settings = require('../models/Settings');

// Multer config for temporary file storage
const upload = multer({ 
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Google Drive auth
function getDriveService() {
  const credPath = path.join(__dirname, '..', 'oauth-credentials.json');
  const tokenPath = path.join(__dirname, '..', 'oauth-token.json');
  
  const credentials = JSON.parse(fs.readFileSync(credPath));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  
  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
  const token = JSON.parse(fs.readFileSync(tokenPath));
  auth.setCredentials(token);
  
  return google.drive({ version: 'v3', auth });
}

async function ensureSettings() {
  return Settings.findOneAndUpdate(
    {},
    { $setOnInsert: { passkey1: '1358549', passkey2: '2283', themeColor: '#5eead4', resumeUrl: '' } },
    { new: true, upsert: true }
  );
}

// GET current settings
router.get('/', async (req, res) => {
  try {
    const settings = await ensureSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST verify stage 1
router.post('/verify/1', async (req, res) => {
  try {
    const { passkey } = req.body;
    const settings = await ensureSettings();
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
    const settings = await ensureSettings();
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
    const { passkey1, passkey2, themeColor, resumeUrl } = req.body;
    let settings = await ensureSettings();
    settings.passkey1 = passkey1 || settings.passkey1;
    settings.passkey2 = passkey2 || settings.passkey2;
    if (themeColor) settings.themeColor = themeColor;
    if (resumeUrl !== undefined) settings.resumeUrl = resumeUrl;
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST upload resume to Google Drive
router.post('/resume/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const drive = getDriveService();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    let finalName = req.file.originalname || `Resume_${Date.now()}.pdf`;
    const nameWithoutExt = finalName.replace(/\.pdf$/i, '');
    
    try {
      // Check for existing files with similar names
      const existing = await drive.files.list({
        q: `"${folderId}" in parents and trashed=false and name contains '${nameWithoutExt.replace(/'/g, "\\'")}'`,
        fields: 'files(name)'
      });
      
      const existingNames = new Set(existing.data.files.map(f => f.name));
      
      if (existingNames.has(finalName)) {
        let counter = 1;
        while (existingNames.has(`${nameWithoutExt} (${counter}).pdf`)) {
          counter++;
        }
        finalName = `${nameWithoutExt} (${counter}).pdf`;
      }
    } catch (e) {
      console.warn('Could not check for duplicate filenames:', e.message);
    }

    // Upload file to Google Drive
    const fileMetadata = {
      name: finalName,
      parents: [folderId],
    };
    const media = {
      mimeType: 'application/pdf',
      body: fs.createReadStream(req.file.path),
    };

    const driveFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Try to make the file publicly viewable, but don't fail if forbidden
    try {
      await drive.permissions.create({
        fileId: driveFile.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.warn('Could not set public permissions automatically:', permErr.message);
      // Continue anyway, as the file uploaded successfully. 
      // The user may need to manually share the folder or file in their Drive.
    }

    const resumeUrl = driveFile.data.webViewLink;

    // Save the link to settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ resumeUrl });
    } else {
      settings.resumeUrl = resumeUrl;
    }
    await settings.save();

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, resumeUrl });
  } catch (err) {
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Resume upload error:', err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// GET list of resumes from Google Drive
router.get('/resumes', async (req, res) => {
  try {
    const drive = getDriveService();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.list({
      q: `"${folderId}" in parents and trashed=false`,
      fields: 'files(id, name, webViewLink, createdTime)',
      orderBy: 'createdTime desc'
    });

    res.json(response.data.files || []);
  } catch (err) {
    console.error('List resumes error:', err);
    res.status(500).json({ message: err.message || 'Failed to list resumes' });
  }
});

// DELETE resume from Google Drive
router.delete('/resumes/:id', async (req, res) => {
  try {
    const drive = getDriveService();
    const fileId = req.params.id;

    // Get the file first to see if it's the active one
    let webViewLink = '';
    try {
      const fileInfo = await drive.files.get({ fileId, fields: 'webViewLink' });
      webViewLink = fileInfo.data.webViewLink;
    } catch (e) {
      // Ignore if we can't get info
    }

    // Delete from drive
    await drive.files.delete({ fileId });

    // If it was the active resume, clear it
    if (webViewLink) {
      const settings = await Settings.findOne();
      if (settings && settings.resumeUrl === webViewLink) {
        settings.resumeUrl = '';
        await settings.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete resume error:', err);
    res.status(500).json({ message: err.message || 'Failed to delete resume' });
  }
});

module.exports = router;
