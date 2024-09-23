const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON data
app.use(bodyParser.json({ limit: '50mb' }));

// Encryption route
app.post('/encrypt', (req, res) => {
  const { audioData, password } = req.body;
  const key = crypto.createHash('sha256').update(password).digest();
  const iv = Buffer.alloc(16, 0);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(Buffer.from(audioData.split(',')[1], 'base64'));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  res.setHeader('Content-Disposition', 'attachment; filename="encrypted_audio.aes"');
  res.send(encrypted);
});

// Decryption route
app.post('/decrypt', (req, res) => {
  const { encryptedAudio, password } = req.body;
  const key = crypto.createHash('sha256').update(password).digest();
  const iv = Buffer.alloc(16, 0);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(Buffer.from(encryptedAudio.split(',')[1], 'base64'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  res.setHeader('Content-Disposition', 'attachment; filename="decrypted_audio.wav"');
  res.send(decrypted);
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

