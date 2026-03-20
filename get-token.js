const { google } = require('googleapis');
const fs = require('fs');
const credentials = require('./oauth-credentials.json');

const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const code = '4/0AfrIepB4SyJnxqXjNNDP9CJFOr6k0_An-KSR_ROoJimWxLGbY9MKCEdU8A6VyREdaahvZQ'; // Replace with actual code

oAuth2Client.getToken(code, (err, token) => {
  if (err) return console.error('Error retrieving access token', err);
  fs.writeFileSync('oauth-token.json', JSON.stringify(token));
  console.log('Token stored to oauth-token.json');
});
