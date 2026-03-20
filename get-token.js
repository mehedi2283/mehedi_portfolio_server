require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

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

const code = process.argv[2] || process.env.GOOGLE_AUTH_CODE;

if (!code) {
  console.error('Missing auth code. Usage: node get-token.js "<google_auth_code>"');
  process.exit(1);
}

oAuth2Client.getToken(code, (err, token) => {
  if (err) return console.error('Error retrieving access token', err);
  fs.writeFileSync('oauth-token.json', JSON.stringify(token));
  console.log('Token stored to oauth-token.json');
});
