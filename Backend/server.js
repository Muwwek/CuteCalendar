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
        user_id: user.id
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
          user_id: results.insertId
        });
      });
    });
  } catch (error) {
    console.log('🔥 Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== TASKS ENDPOINTS ====================

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

// ดึง tasks ทั้งหมดของ user
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

// ดึง task เฉพาะรายการ พร้อมข้อมูล user
app.get('/tasks/detail/:task_id', (req, res) => {
  try {
    const { task_id } = req.params;
    console.log('📝 Fetching task detail, ID:', task_id);

    const query = `
      SELECT t.*, u.username, u.email
      FROM tasks t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;

    connection.query(query, [task_id], (error, results) => {
      if (error) {
        console.log('❌ Fetch task detail error:', error);
        return res.status(500).json({ success: false, message: 'Cannot fetch task detail' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      
      console.log('✅ Task detail found, ID:', task_id);
      res.json({ 
        success: true, 
        task: results[0]
      });
    });
  } catch (error) {
    console.log('🔥 Fetch task detail server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ดึง tasks ตามวันที่เฉพาะเจาะจง
app.get('/tasks/:user_id/date/:date', (req, res) => {
  try {
    const { user_id, date } = req.params;
    console.log(`📅 Fetching tasks for user ${user_id} on date:`, date);

    const query = `
      SELECT * FROM tasks 
      WHERE user_id = ? AND start_date = ?
      ORDER BY start_time ASC
    `;

    connection.query(query, [user_id, date], (error, results) => {
      if (error) {
        console.log('❌ Fetch tasks by date error:', error);
        return res.status(500).json({ success: false, message: 'Cannot fetch tasks' });
      }
      
      console.log(`✅ Found ${results.length} tasks for ${date}`);
      res.json({ 
        success: true, 
        tasks: results 
      });
    });
  } catch (error) {
    console.log('🔥 Fetch tasks by date server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ดึง tasks ตามช่วงเวลา (สำหรับดูในปฏิทินทั้งเดือน)
app.get('/tasks/:user_id/range', (req, res) => {
  try {
    const { user_id } = req.params;
    const { start_date, end_date } = req.query;
    
    console.log(`📊 Fetching tasks for user ${user_id} from ${start_date} to ${end_date}`);

    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'start_date and end_date are required' });
    }

    const query = `
      SELECT * FROM tasks 
      WHERE user_id = ? 
      AND start_date BETWEEN ? AND ?
      ORDER BY start_date ASC, start_time ASC
    `;

    connection.query(query, [user_id, start_date, end_date], (error, results) => {
      if (error) {
        console.log('❌ Fetch tasks by range error:', error);
        return res.status(500).json({ success: false, message: 'Cannot fetch tasks' });
      }
      
      console.log(`✅ Found ${results.length} tasks in date range`);
      res.json({ 
        success: true, 
        tasks: results 
      });
    });
  } catch (error) {
    console.log('🔥 Fetch tasks by range server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// อัพเดท task
app.put('/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const { 
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
      priority,
      status 
    } = req.body;

    console.log('✏️ Updating task ID:', task_id);

    const query = `
      UPDATE tasks 
      SET 
        title = ?, 
        description = ?, 
        category = ?, 
        duration = ?, 
        duration_unit = ?, 
        start_date = ?, 
        end_date = ?, 
        start_time = ?, 
        end_time = ?, 
        color = ?, 
        reminder = ?,
        priority = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    connection.query(query, [
      title, description, category, duration, duration_unit, 
      start_date, end_date, start_time, end_time, color, reminder, priority, status, task_id
    ], (error, results) => {
      if (error) {
        console.log('❌ Update task error:', error);
        return res.status(500).json({ success: false, message: 'Cannot update task' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      
      console.log('✅ Task updated successfully, ID:', task_id);
      res.json({ 
        success: true, 
        message: 'อัพเดทงานเรียบร้อย!'
      });
    });
  } catch (error) {
    console.log('🔥 Update task server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// อัพเดทสถานะ task
app.patch('/tasks/:task_id/status', (req, res) => {
  try {
    const { task_id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating task ${task_id} status to:`, status);

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const query = `
      UPDATE tasks 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    connection.query(query, [status, task_id], (error, results) => {
      if (error) {
        console.log('❌ Update task status error:', error);
        return res.status(500).json({ success: false, message: 'Cannot update status' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      
      console.log('✅ Task status updated successfully');
      res.json({ 
        success: true, 
        message: 'อัพเดทสถานะเรียบร้อย!'
      });
    });
  } catch (error) {
    console.log('🔥 Update status server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ลบ task
app.delete('/tasks/:task_id', (req, res) => {
  try {
    const { task_id } = req.params;
    console.log('🗑️ Deleting task ID:', task_id);

    const query = 'DELETE FROM tasks WHERE id = ?';

    connection.query(query, [task_id], (error, results) => {
      if (error) {
        console.log('❌ Delete task error:', error);
        return res.status(500).json({ success: false, message: 'Cannot delete task' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      
      console.log('✅ Task deleted successfully, ID:', task_id);
      res.json({ 
        success: true, 
        message: 'ลบงานเรียบร้อย!'
      });
    });
  } catch (error) {
    console.log('🔥 Delete task server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// นับจำนวน tasks แต่ละสถานะ (สถิติ)
app.get('/tasks/:user_id/stats', (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('📈 Fetching task statistics for user:', user_id);

    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority
      FROM tasks 
      WHERE user_id = ?
    `;

    connection.query(query, [user_id], (error, results) => {
      if (error) {
        console.log('❌ Fetch stats error:', error);
        return res.status(500).json({ success: false, message: 'Cannot fetch statistics' });
      }
      
      console.log('✅ Task statistics fetched successfully');
      res.json({ 
        success: true, 
        stats: results[0]
      });
    });
  } catch (error) {
    console.log('🔥 Fetch stats server error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== TEST ENDPOINT ====================

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    endpoints: {
      user: ['/login', '/register'],
      tasks: [
        'POST /tasks',
        'GET /tasks/:user_id',
        'GET /tasks/detail/:task_id',
        'GET /tasks/:user_id/date/:date',
        'GET /tasks/:user_id/range?start_date=&end_date=',
        'PUT /tasks/:task_id',
        'PATCH /tasks/:task_id/status',
        'DELETE /tasks/:task_id',
        'GET /tasks/:user_id/stats'
      ]
    }
  });
});

// ==================== START SERVER ====================

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Access from mobile: http://192.168.1.9:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   User: /login, /register');
  console.log('   Tasks: /tasks, /tasks/:user_id, /tasks/detail/:task_id');
  console.log('   Tasks: /tasks/:user_id/date/:date, /tasks/:user_id/range');
  console.log('   Tasks: PUT /tasks/:task_id, PATCH /tasks/:task_id/status');
  console.log('   Tasks: DELETE /tasks/:task_id, /tasks/:user_id/stats');
});