// Backend/server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mew099183@',
  database: 'userdb'
});

connection.connect(err => {
  if (err) {
    console.log('❌ Database connection failed: ' + err.stack);
    return;
  }
  console.log('✅ Connected to database');
});

// ==================== USER ENDPOINTS ====================

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
      if (error || results.length === 0) {
        return res.status(401).json({ success: false, message: 'Email หรือ Password ไม่ถูกต้อง' });
      }
      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Email หรือ Password ไม่ถูกต้อง' });
      }
      res.json({ 
        success: true, 
        message: 'Login สำเร็จ',
        username: user.username,
        email: user.email,
        user_id: user.id
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkEmailQuery, [email], async (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'Email นี้มีผู้ใช้งานแล้ว' });
      }
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const insertQuery = 'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())';
      connection.query(insertQuery, [username, email, hashedPassword], (error, results) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Registration failed' });
        }
        res.json({ 
          success: true, 
          message: 'สมัครสมาชิกเรียบร้อย!',
          user_id: results.insertId
        });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/// ==================== TASKS ENDPOINTS ====================

// สร้าง task ใหม่
app.post('/tasks', async (req, res) => {
  try {
    const { 
      user_id, title, description = '', category = 'ทั่วไป', 
      start_date, end_date, start_time, end_time, 
      priority = 'medium', status = 'pending'
    } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ success: false, message: 'User ID and title are required' });
    }

    // ✅ แก้ไข: เพิ่ม task_date ให้ตรงกับ DB (ใช้ start_date)
    const query = `
      INSERT INTO tasks (
        user_id, title, description, category, 
        start_date, end_date, start_time, end_time, 
        priority, status, task_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      user_id, title, description, category,
      start_date, end_date || start_date,
      start_time, end_time || start_time,
      priority, status, start_date   // ✅ task_date = start_date
    ];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('❌ Task creation DB error:', error);
        return res.status(500).json({ success: false, message: 'Database error', error: error.sqlMessage });
      }
      res.status(201).json({ success: true, message: 'สร้างงานเรียบร้อย!', task_id: results.insertId });
    });
  } catch (error) {
    console.error('🔥 Task creation server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ดึง tasks ทั้งหมดของ user
app.get('/tasks/:user_id', (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id || user_id === '0') {
      return res.json({ success: true, tasks: [] });
    }
    const query = `SELECT * FROM tasks WHERE user_id = ? ORDER BY start_date ASC, start_time ASC`;
    connection.query(query, [user_id], (error, results) => {
      if (error) {
        console.error('❌ Fetch tasks error:', error);
        return res.status(500).json({ success: false, message: 'Cannot fetch tasks' });
      }
      res.json({ success: true, tasks: results });
    });
  } catch (error) {
    console.error('🔥 Fetch tasks server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// อัพเดท task ทั้งหมด
app.put('/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const { 
      title, description, category, start_date, 
      end_date, start_time, end_time, priority, status
    } = req.body;

    // ✅ แก้ไข: ทำให้ Query ตรงกับโครงสร้าง DB
    const query = `
      UPDATE tasks SET title = ?, description = ?, category = ?, 
      start_date = ?, end_date = ?, start_time = ?, end_time = ?, 
      priority = ?, status = ?, updated_at = NOW() WHERE id = ?
    `;
    connection.query(query, [
      title, description, category, start_date, end_date, 
      start_time, end_time, priority, status, task_id
    ], (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Cannot update task' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.json({ success: true, message: 'อัพเดทงานเรียบร้อย!' });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ... (Endpoints อื่นๆ เหมือนเดิม) ...

// อัพเดทเฉพาะ status
app.patch('/tasks/:task_id/status', (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const query = `UPDATE tasks SET status = ?, updated_at = NOW() WHERE id = ?`;
    connection.query(query, [status, task_id], (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Cannot update status' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.json({ success: true, message: 'อัพเดทสถานะเรียบร้อย!' });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ลบ task
app.delete('/tasks/:task_id', (req, res) => {
  try {
    const { task_id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';
    connection.query(query, [task_id], (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Cannot delete task' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.json({ success: true, message: 'ลบงานเรียบร้อย!' });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ดึงข้อมูลสถิติ
app.get('/tasks/:user_id/stats', (req, res) => {
  try {
    const { user_id } = req.params;
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks 
      WHERE user_id = ?
    `;
    connection.query(query, [user_id], (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Cannot fetch statistics' });
      }
      res.json({ success: true, stats: results[0] });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ==================== TEST ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});


// ==================== START SERVER ====================
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

