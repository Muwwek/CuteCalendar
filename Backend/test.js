// Backend/server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ connection pool แทน single connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Mew099183@',
  database: 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.log('❌ Database connection failed: ' + err.stack);
    return;
  }
  console.log('✅ Connected to database');
  connection.release();
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const query = 'SELECT * FROM users WHERE email = ?';
    pool.query(query, [email], async (error, results) => {
      if (error) {
        console.error('❌ Login database error:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
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
    console.error('❌ Login server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    pool.query(checkEmailQuery, [email], async (error, results) => {
      if (error) {
        console.error('❌ Register database error:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'Email นี้มีผู้ใช้งานแล้ว' });
      }
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const insertQuery = 'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())';
      pool.query(insertQuery, [username, email, hashedPassword], (error, results) => {
        if (error) {
          console.error('❌ Register insert error:', error);
          return res.status(500).json({ success: false, message: 'Registration failed' });
        }
        
        res.json({ 
          success: true, 
          message: 'สมัครสมาชิกเรียบร้อย!',
          username: username,
          email: email,
          user_id: results.insertId
        });
      });
    });
  } catch (error) {
    console.error('❌ Register server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Tasks Endpoints

// Get tasks with query parameter - แก้ไขให้มี debug มากขึ้น
app.get('/tasks', (req, res) => {
  try {
    const { userId } = req.query;
    console.log('📥 GET /tasks - userId:', userId, 'Type:', typeof userId);

    if (!userId || userId === '0' || userId === 'undefined') {
      console.log('ℹ️ No userId provided, returning empty array');
      return res.json([]);
    }

    // ตรวจสอบว่า userId เป็นตัวเลข
    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      console.log('❌ Invalid userId:', userId);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // ตรวจสอบว่ามีตาราง tasks หรือไม่
    const checkTableQuery = `
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = 'userdb' AND table_name = 'tasks'
    `;

    pool.query(checkTableQuery, (tableError, tableResults) => {
      if (tableError) {
        console.error('❌ Check table error:', tableError);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error - cannot check table',
          error: tableError.message 
        });
      }

      const tableExists = tableResults[0].table_exists > 0;
      console.log('📊 Tasks table exists:', tableExists);

      if (!tableExists) {
        console.log('❌ Tasks table does not exist');
        return res.status(500).json({ 
          success: false, 
          message: 'Tasks table does not exist',
          error: 'Table not found'
        });
      }

      const query = `
        SELECT id as task_id, user_id, title, description, 
               category as category_name, duration as duration_minutes,
               start_date as task_date, start_time, end_time, priority,
               COALESCE(status, 'pending') as status, created_at, updated_at
        FROM tasks 
        WHERE user_id = ? 
        ORDER BY start_date ASC, start_time ASC
      `;

      console.log('📊 Executing query for user:', numericUserId);
      
      pool.query(query, [numericUserId], (error, results) => {
        if (error) {
          console.error('❌ Database error in /tasks:', error);
          console.error('❌ SQL Error Code:', error.code);
          console.error('❌ SQL Error Number:', error.errno);
          console.error('❌ SQL State:', error.sqlState);
          
          return res.status(500).json({ 
            success: false, 
            message: 'Cannot fetch tasks',
            error: error.message,
            sqlError: {
              code: error.code,
              errno: error.errno,
              sqlState: error.sqlState
            }
          });
        }
        
        console.log('✅ Tasks fetched successfully:', results.length, 'tasks');
        console.log('📋 Sample task:', results.length > 0 ? results[0] : 'No tasks');
        res.json(results);
      });
    });
  } catch (error) {
    console.error('❌ Server error in /tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// สร้าง task ใหม่
app.post('/tasks', async (req, res) => {
  try {
    console.log('📥 POST /tasks - Body:', req.body);
    
    const { 
      user_id, 
      title, 
      description, 
      category_name,
      duration_minutes,
      task_date,
      start_time, 
      end_time, 
      priority 
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const query = `
      INSERT INTO tasks 
      (user_id, title, description, category, duration, start_date, start_time, end_time, priority, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    pool.query(query, [
      user_id, 
      title.trim(), 
      description || '', 
      category_name || 'งานรอง', 
      duration_minutes || 60, 
      task_date || new Date().toISOString().split('T')[0],
      start_time || null, 
      end_time || null, 
      priority || 3
    ], (error, results) => {
      if (error) {
        console.error('❌ Insert task error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Cannot create task',
          error: error.message 
        });
      }
      
      console.log('✅ Task created successfully, ID:', results.insertId);
      res.json({ 
        success: true, 
        message: 'สร้างงานเรียบร้อย!',
        task_id: results.insertId 
      });
    });
  } catch (error) {
    console.error('❌ Server error in POST /tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ดึง tasks ของ user (parameter-based) - แก้ไขเหมือนด้านบน
app.get('/tasks/:user_id', (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('📥 GET /tasks/:user_id - user_id:', user_id);

    if (!user_id || user_id === '0' || user_id === 'undefined') {
      console.log('ℹ️ No user_id provided, returning empty array');
      return res.json({ success: true, tasks: [] });
    }

    const numericUserId = parseInt(user_id);
    if (isNaN(numericUserId)) {
      console.log('❌ Invalid user_id:', user_id);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // ตรวจสอบตาราง
    const checkTableQuery = `
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = 'userdb' AND table_name = 'tasks'
    `;

    pool.query(checkTableQuery, (tableError, tableResults) => {
      if (tableError) {
        console.error('❌ Check table error:', tableError);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error - cannot check table',
          error: tableError.message 
        });
      }

      const tableExists = tableResults[0].table_exists > 0;
      console.log('📊 Tasks table exists:', tableExists);

      if (!tableExists) {
        return res.status(500).json({ 
          success: false, 
          message: 'Tasks table does not exist',
          error: 'Table not found'
        });
      }

      const query = `
        SELECT id as task_id, user_id, title, description, 
               category as category_name, duration as duration_minutes,
               start_date as task_date, start_time, end_time, priority,
               COALESCE(status, 'pending') as status, created_at, updated_at
        FROM tasks 
        WHERE user_id = ? 
        ORDER BY start_date ASC, start_time ASC
      `;

      console.log('📊 Executing query for user:', numericUserId);

      pool.query(query, [numericUserId], (error, results) => {
        if (error) {
          console.error('❌ Database error in /tasks/:user_id:', error);
          console.error('❌ SQL Error Code:', error.code);
          console.error('❌ SQL Error Number:', error.errno);
          console.error('❌ SQL State:', error.sqlState);
          
          return res.status(500).json({ 
            success: false, 
            message: 'Cannot fetch tasks',
            error: error.message,
            sqlError: {
              code: error.code,
              errno: error.errno,
              sqlState: error.sqlState
            }
          });
        }
        
        console.log('✅ Tasks fetched successfully:', results.length, 'tasks');
        res.json({ 
          success: true, 
          tasks: results 
        });
      });
    });
  } catch (error) {
    console.error('❌ Server error in /tasks/:user_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// ดึงข้อมูลผู้ใช้
app.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 GET /users/:id - id:', id);

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const query = 'SELECT id, username, email FROM users WHERE id = ?';
    
    pool.query(query, [numericId], (error, results) => {
      if (error) {
        console.error('❌ Database error in /users/:id:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.json({ 
        success: true, 
        user: results[0] 
      });
    });
  } catch (error) {
    console.error('❌ Server error in /users/:id:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Access from mobile: http://192.168.1.9:${PORT}`);
  console.log(`🔍 Health check: http://192.168.1.9:${PORT}/health`);
  console.log(`📋 API Documentation: http://192.168.1.9:${PORT}/`);
});