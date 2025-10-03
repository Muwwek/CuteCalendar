// Backend/server.js
const express = require('express');
const mysql = require('mysql2/promise'); // ใช้ promise version
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== MySQL Pool ====================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Mew099183@',
  database: 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ฟังก์ชันตรวจสอบ TIME/DATE
function isValidTime(time) {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time);
}
function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

// ==================== USER ENDPOINTS ====================

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Email หรือ Password ไม่ถูกต้อง' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Email หรือ Password ไม่ถูกต้อง' });

    res.json({ 
      success: true, 
      message: 'Login สำเร็จ',
      username: user.username,
      email: user.email,
      user_id: user.id
    });
  } catch (error) {
    console.error('🔥 /login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email นี้มีผู้ใช้งานแล้ว' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hashedPassword]
    );

    res.json({ success: true, message: 'สมัครสมาชิกเรียบร้อย!', user_id: result.insertId });
  } catch (error) {
    console.error('🔥 /register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== TASKS ENDPOINTS ====================

// Create task
app.post('/tasks', async (req, res) => {
  try {
    const { 
      user_id, title, description = '', category = 'ทั่วไป', 
      start_date, end_date, start_time, end_time, 
      priority = 'medium', status = 'pending'
    } = req.body;

    if (!user_id || !title || !start_date || !start_time) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' });
    }
    if (!isValidDate(start_date) || (end_date && !isValidDate(end_date))) {
      return res.status(400).json({ success: false, message: 'Invalid date format (YYYY-MM-DD)' });
    }
    if (!isValidTime(start_time) || (end_time && !isValidTime(end_time))) {
      return res.status(400).json({ success: false, message: 'Invalid time format (HH:MM:SS)' });
    }

    const [result] = await pool.query(`
      INSERT INTO tasks (
        user_id, title, description, category,
        start_date, end_date, start_time, end_time,
        priority, status, task_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      user_id, title, description, category,
      start_date, end_date || start_date,
      start_time, end_time || start_time,
      priority, status, start_date
    ]);

    res.status(201).json({ success: true, message: 'สร้างงานเรียบร้อย!', task_id: result.insertId });
  } catch (error) {
    console.error('🔥 /tasks POST error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.sqlMessage });
  }
});

// Get tasks by user
app.get('/tasks/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id || user_id === '0') return res.json({ success: true, tasks: [] });

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY start_date ASC, start_time ASC', [user_id]);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('🔥 /tasks/:user_id GET error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update task
app.put('/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const { 
      title, description = '', category = 'ทั่วไป', start_date, 
      end_date, start_time, end_time, priority = 'medium', status = 'pending'
    } = req.body;

    if (!title || !start_date || !start_time) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' });
    }
    if (!isValidDate(start_date) || (end_date && !isValidDate(end_date))) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }
    if (!isValidTime(start_time) || (end_time && !isValidTime(end_time))) {
      return res.status(400).json({ success: false, message: 'Invalid time format' });
    }

    const [result] = await pool.query(`
      UPDATE tasks SET 
        title = ?, description = ?, category = ?, 
        start_date = ?, end_date = ?, start_time = ?, end_time = ?, 
        priority = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      title, description, category,
      start_date, end_date || start_date,
      start_time, end_time || start_time,
      priority, status, task_id
    ]);

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'อัพเดทงานเรียบร้อย!' });
  } catch (error) {
    console.error('🔥 /tasks/:task_id PUT error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update task status only
app.patch('/tasks/:task_id/status', async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const [result] = await pool.query('UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?', [status, task_id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'อัพเดทสถานะเรียบร้อย!' });
  } catch (error) {
    console.error('🔥 /tasks/:task_id/status PATCH error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete task
app.delete('/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [task_id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'ลบงานเรียบร้อย!' });
  } catch (error) {
    console.error('🔥 /tasks/:task_id DELETE error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get task stats
app.get('/tasks/:user_id/stats', async (req, res) => {
  try {
    const { user_id } = req.params;
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks 
      WHERE user_id = ?
    `, [user_id]);

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error('🔥 /tasks/:user_id/stats GET error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// ==================== START SERVER ====================
const PORT = 3000;

async function startServer() {
  try {
    // ทดสอบ connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected');
    connection.release();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();
