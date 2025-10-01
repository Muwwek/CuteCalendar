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

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt for email:', email);
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.log('❌ Database error:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        console.log('⚠️ Email not found:', email);
        return res.status(401).json({ success: false, message: 'Email หรือ Password ไม่ถูกต้อง' });
      }
      
      const user = results[0];
      console.log('✅ User found:', user.username);
      
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', user.username);
        return res.status(401).json({ success: false, message: 'Email หรือ Password ไม่ถูกต้อง' });
      }
      
      console.log('🎉 Login successful for user:', user.username);
      res.json({ 
        success: true, 
        message: 'Login สำเร็จ',
        username: user.username,
        email: user.email,
        user_id: user.id // ✅ ส่ง user_id กลับไปด้วย
      });
    });
  } catch (error) {
    console.log('🔥 Server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('📝 Register attempt:', { username, email });
    
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // ตรวจสอบว่ามี email นี้แล้วหรือไม่
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkEmailQuery, [email], async (error, results) => {
      if (error) {
        console.log('❌ Database error while checking email:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length > 0) {
        console.log('⚠️ Email already in use:', email);
        return res.status(400).json({ success: false, message: 'Email นี้มีผู้ใช้งานแล้ว' });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // บันทึกผู้ใช้ใหม่
      const insertQuery = 'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())';
      connection.query(insertQuery, [username, email, hashedPassword], (error, results) => {
        if (error) {
          console.log('❌ Insert error:', error);
          return res.status(500).json({ success: false, message: 'Registration failed' });
        }
        
        console.log('🎉 User registered successfully:', username);
        res.json({ 
          success: true, 
          message: 'สมัครสมาชิกเรียบร้อย!',
          username: username,
          email: email,
          user_id: results.insertId // ✅ ส่ง user_id กลับไปด้วย
        });
      });
    });
  } catch (error) {
    console.log('🔥 Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Tasks Endpoints

// สร้าง task ใหม่
app.post('/tasks', async (req, res) => {
  try {
    const { 
      user_id, 
      title, 
      description, 
      category, 
      duration, 
      duration_unit, 
      start_date, 
      end_date, 
      start_time, 
      end_time, 
      color, 
      reminder,
      priority 
    } = req.body;

    console.log('📝 Creating new task for user:', user_id);

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const query = `
      INSERT INTO tasks 
      (user_id, title, description, category, duration, duration_unit, start_date, end_date, start_time, end_time, color, reminder, priority, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    connection.query(query, [
      user_id, title, description, category, duration, duration_unit, 
      start_date, end_date, start_time, end_time, color, reminder, priority
    ], (error, results) => {
      if (error) {
        console.log('❌ Task creation error:', error);
        return res.status(500).json({ success: false, message: 'Cannot create task' });
      }
      
      console.log('✅ Task created successfully, ID:', results.insertId);
      res.json({ 
        success: true, 
        message: 'สร้างงานเรียบร้อย!',
        task_id: results.insertId 
      });
    });
  } catch (error) {
    console.log('🔥 Task creation server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ดึง tasks ของ user
app.get('/tasks/:user_id', (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('📋 Fetching tasks for user:', user_id);

    if (!user_id || user_id === '0') {
      return res.json({ success: true, tasks: [] });
    }

    const query = `
      SELECT * FROM tasks 
      WHERE user_id = ? 
      ORDER BY start_date ASC, start_time ASC
    `;

    connection.query(query, [user_id], (error, results) => {
      if (error) {
        console.log('❌ Fetch tasks error:', error);
        return res.status(500).json({ success: false, message: 'Cannot fetch tasks' });
      }
      
      console.log(`✅ Found ${results.length} tasks for user ${user_id}`);
      res.json({ 
        success: true, 
        tasks: results 
      });
    });
  } catch (error) {
    console.log('🔥 Fetch tasks server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Access from mobile: http://192.168.1.9:${PORT}`);
});