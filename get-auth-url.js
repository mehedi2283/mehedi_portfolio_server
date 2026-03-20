require('dotenv').config();
const { google } = require('googleapis');

let clientId = process.env.GOOGLE_CLIENT_ID;
let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
let redirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectUri) {
  try {
    // eslint-disable-next-line global-require
    const credentials = require('./oauth-credentials.json');
    const { client_secret, client_id, redirect_uris } = credentials.web;
    clientId = clientId || client_id;
    clientSecret = clientSecret || client_secret;
    redirectUri = redirectUri || redirect_uris[0];
  } catch (_e) {
    // handled below
  }
}

if (!clientId || !clientSecret || !redirectUri) {
  console.error('Missing Google OAuth credentials. Provide GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI.');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Forces Google to issue a refresh token
});

console.log('Authorize this app by visiting this url:', authUrl);
console.log(`\nAfter logging in, you will be redirected to ${redirectUri}?code=...`);
console.log('Copy the code value and run: node get-token.js "<code>"');
