// Backend/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mew099183@", 
  database: "UserDB",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection error:", err);
  } else {
    console.log("Connected to MySQL");
    
    // สร้างตารางถ้ายังไม่มี (Auto-create table)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.query(createTableQuery, (err) => {
      if (err) {
        console.log("Error creating table:", err);
      } else {
        console.log("Users table is ready");
      }
    });
  }
});

// API สำหรับ register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("Register attempt:", { username, email });

  if (!username || !email || !password) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลครบ" });
  }

  try {
    // ตรวจสอบว่ามี email นี้แล้วหรือยัง
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        console.log("Email check error:", err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" });
      }

      if (results.length > 0) {
        console.log("Email already exists:", email);
        return res.status(400).json({ message: "Email นี้มีการใช้งานแล้ว" });
      }

      // ตรวจสอบว่ามี username นี้แล้วหรือยัง
      const checkUsernameQuery = "SELECT * FROM users WHERE username = ?";
      db.query(checkUsernameQuery, [username], async (err, results) => {
        if (err) {
          console.log("Username check error:", err);
          return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" });
        }

        if (results.length > 0) {
          console.log("Username already exists:", username);
          return res.status(400).json({ message: "Username นี้มีการใช้งานแล้ว" });
        }

        // เข้ารหัส password
        const hashedPassword = await bcrypt.hash(password, 10);

        // เพิ่มข้อมูลลง DB
        const insertQuery = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        
        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
          if (err) {
            console.log("Insert user error:", err);
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
          }
          console.log("User registered successfully:", username);
          res.json({ message: "สมัครสมาชิกเรียบร้อย!" });
        });
      });
    });
  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
});

// API สำหรับ login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  console.log("Login attempt - Email:", email);

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "กรุณากรอก Email และ Password" 
    });
  }

  try {
    // ค้นหาผู้ใช้จาก email
    const query = "SELECT * FROM users WHERE email = ?";
    console.log("Executing SQL query:", query, "with email:", email);
    
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.log("Database query error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" 
        });
      }

      console.log("Query results length:", results.length);
      console.log("Query results:", results);

      if (results.length === 0) {
        console.log("No user found for email:", email);
        return res.status(401).json({ 
          success: false, 
          message: "Email หรือ Password ไม่ถูกต้อง" 
        });
      }

      const user = results[0];
      console.log("User found - ID:", user.id, "Username:", user.username, "Email:", user.email);

      // ตรวจสอบ password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Invalid password for user:", user.email);
        return res.status(401).json({ 
          success: false, 
          message: "Email หรือ Password ไม่ถูกต้อง" 
        });
      }

      // Login สำเร็จ
      console.log("Login successful for user:", user.username);
      res.json({
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.log("Login system error:", error);
    res.status(500).json({ 
      success: false, 
      message: "เกิดข้อผิดพลาดในระบบ" 
    });
  }
});

// API สำหรับดูข้อมูลผู้ใช้ทั้งหมด (สำหรับทดสอบ)
app.get("/users", (req, res) => {
  const query = "SELECT id, username, email, created_at FROM users";
  
  db.query(query, (err, results) => {
    if (err) {
      console.log("Get users error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
    console.log("All users:", results);
    res.json({ users: results });
  });
});

// API สำหรับตรวจสอบการทำงาน
app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!",
    endpoints: {
      register: "POST /register",
      login: "POST /login", 
      users: "GET /users"
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Database: UserDB`);
  console.log(`👥 Table: users (auto-created if not exists)`);
});