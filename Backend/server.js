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
  database: 'UserDB'
});

connection.connect(err => {
  if (err) {
    console.log('Database connection failed: ' + err.stack);
    return;
  }
  console.log('✅ Connected to database');
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt for email:', email);
    
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.log('❌ Database error:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        console.log('⚠️ Email not found:', email);
        return res.status(401).json({ success: false, message: 'Email ไม่ถูกต้อง' });
      }
      
      const user = results[0];
      console.log('✅ User found:', user.username);
      
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', user.username);
        return res.status(401).json({ success: false, message: 'Password ไม่ถูกต้อง' });
      }
      
      console.log('🎉 Login successful for user:', user.username);
      res.json({ 
        success: true, 
        message: 'Login สำเร็จ',
        username: user.username,
        email: user.email
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
          email: email
        });
      });
    });
  } catch (error) {
    console.log('🔥 Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
