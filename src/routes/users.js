const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const result = await pool.query('SELECT id, username, email, role, profile_image FROM users ORDER BY username');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const result = await pool.query('SELECT id, username, email, role, profile_image FROM users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create users' });
        }
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role', [username, email, hashedPassword, role || 'user']);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const pool = req.app.locals.pool;
        const { username, email, role } = req.body;
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const result = await pool.query('UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), role = COALESCE($3, role), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, username, email, role', [username, email, role, req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;