const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = req.app.locals.pool;

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (user.two_fa_enabled) {
      return res.json({ 
        requiresTwoFA: true, 
        temp_token: jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '5m' })
      });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { temp_token, token } = req.body;
    const pool = req.app.locals.pool;

    const decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }

    const authToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: authToken, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Setup 2FA
router.post('/setup-2fa', async (req, res) => {
  try {
    const { userId } = req.body;
    const pool = req.app.locals.pool;

    const secret = speakeasy.generateSecret({
      name: `Yellow Goat (${userId})`
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ 
      secret: secret.base32, 
      qrCode,
      message: 'Scan this QR code with your authenticator app'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enable 2FA
router.post('/enable-2fa', async (req, res) => {
  try {
    const { userId, secret } = req.body;
    const pool = req.app.locals.pool;

    await pool.query('UPDATE users SET two_fa_secret = $1, two_fa_enabled = true WHERE id = $2', [secret, userId]);
    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;