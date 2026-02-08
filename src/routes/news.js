const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware: Verify JWT
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

// Get all news (sorted by newest first)
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT n.*, u.username, 
             (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id) as likes_count,
             (SELECT COUNT(*) FROM news_comments WHERE news_id = n.id) as comments_count,
             (SELECT EXISTS(SELECT 1 FROM news_likes WHERE news_id = n.id AND user_id = $1)) as user_liked
      FROM news n
      JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `,
    [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create news (only admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create news' });
    }

    const { title, description, short_description, image_url, file_url } = req.body;

    const result = await pool.query(
      'INSERT INTO news (title, description, short_description, image_url, file_url, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, short_description, image_url, file_url, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like news
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;

    await pool.query(
      'INSERT INTO news_likes (news_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, req.user.id]
    );

    const result = await pool.query('SELECT COUNT(*) as likes_count FROM news_likes WHERE news_id = $1', [id]);
    res.json({ likes_count: parseInt(result.rows[0].likes_count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlike news
router.post('/:id/unlike', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;

    await pool.query('DELETE FROM news_likes WHERE news_id = $1 AND user_id = $2', [id, req.user.id]);

    const result = await pool.query('SELECT COUNT(*) as likes_count FROM news_likes WHERE news_id = $1', [id]);
    res.json({ likes_count: parseInt(result.rows[0].likes_count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    const { comment } = req.body;

    const result = await pool.query(
      'INSERT INTO news_comments (news_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
      [id, req.user.id, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments
router.get('/:id/comments', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(`
      SELECT nc.*, u.username 
      FROM news_comments nc
      JOIN users u ON nc.user_id = u.id
      WHERE nc.news_id = $1
      ORDER BY nc.created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;