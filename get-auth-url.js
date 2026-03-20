require('dotenv').config();
const { google } = require('googleapis');
const credentials = require('./oauth-credentials.json');

const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Forces Google to issue a refresh token
});

console.log('Authorize this app by visiting this url:', authUrl);
console.log('\nAfter logging in, you will be redirected to http://localhost:5000/oauth2callback?code=...');
console.log('Copy the ENTIRE URL you are redirected to, and paste it back into the chat.');
