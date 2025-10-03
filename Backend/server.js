// Backend/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // ใช้ promise version
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== MySQL Pool ====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==================== Validation ====================
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

    const hashedPassword = await bcrypt.hash(password, 14);
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

// AI Suggestion (Enhanced Version)
app.post("/ai/suggest-task", async (req, res) => {
  try {
    const { text } = req.body;
    const lowerText = text.toLowerCase();
    
    let suggestion = { 
      category: "งาน", 
      priority: "medium", 
      description: `งาน: ${text} - ควรวางแผนและจัดการเวลาให้เหมาะสม`
    };

    // ==================== หมวดหมู่: เรียน ====================
    if (lowerText.includes("สอบ") || lowerText.includes("เทส") || lowerText.includes("test") || lowerText.includes("exam")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "📚 อ่านหนังสือทบทวนบทที่สำคัญ เตรียมตัวสอบให้พร้อม ควรเริ่มอ่านล่วงหน้า 1 สัปดาห์" 
      };
    }
    else if (lowerText.includes("สอบไฟนอล") || lowerText.includes("final") || lowerText.includes("สอบปลายภาค")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "🎯 เตรียมตัวสอบไฟนอล อ่านสรุปเนื้อหาทั้งเทอม ทำโจทย์เก่าๆ เพื่อความคุ้นเคย" 
      };
    }
    else if (lowerText.includes("สอบมิดเทอม") || lowerText.includes("midterm") || lowerText.includes("สอบกลางภาค")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "📝 เตรียมสอบมิดเทอม ทบทวนเนื้อหาครึ่งแรกของเทอม จดโน้ตสำคัญ" 
      };
    }
    else if (lowerText.includes("ส่งงาน") || lowerText.includes("assignment") || lowerText.includes("homework") || lowerText.includes("การบ้าน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "✍️ เร่งทำงานให้เสร็จทันตามกำหนดส่ง ตรวจสอบ requirement ให้ครบถ้วน" 
      };
    }
    else if (lowerText.includes("โปรเจค") || lowerText.includes("project") || lowerText.includes("โครงงาน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "📁 จัดการโปรเจค จัดทำ timeline กำหนดหน้าที่รับผิดชอบของสมาชิกในทีม" 
      };
    }
    else if (lowerText.includes("present") || lowerText.includes("นำเสนอ") || lowerText.includes("พรีเซ้น") || lowerText.includes("presentation")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "🎤 เตรียมสไลด์และฝึกซ้อมการนำเสนอ จับเวลาการพูดให้เหมาะสม" 
      };
    }
    else if (lowerText.includes("เรียน") || lowerText.includes("lecture") || lowerText.includes("คาบ") || lowerText.includes("class")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "📖 เตรียมตัวเข้าเรียนและจดบันทึกเนื้อหาสำคัญ อ่านล่วงหน้าสำหรับคาบถัดไป" 
      };
    }
    else if (lowerText.includes("ติว") || lowerText.includes("tutor") || lowerText.includes("สอนเพื่อน") || lowerText.includes("ทบทวน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "👨‍🏫 อ่านหนังสือเตรียมตัวไปติวหรือสอนเพื่อนๆ เตรียมโจทย์และตัวอย่าง" 
      };
    }
    else if (lowerText.includes("แลป") || lowerText.includes("lab") || lowerText.includes("ปฏิบัติการ") || lowerText.includes("laboratory")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "🔬 เตรียมอุปกรณ์แลป อ่านคู่มือการทดลองล่วงหน้า จดบันทึกผลการทดลอง" 
      };
    }
    else if (lowerText.includes("รายงาน") || lowerText.includes("report") || lowerText.includes("เขียนรายงาน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "📊 รวบรวมข้อมูลและเขียนรายงานให้ครบถ้วน ตรวจสอบการอ้างอิงให้ถูกต้อง" 
      };
    }
    else if (lowerText.includes("วิจัย") || lowerText.includes("research") || lowerText.includes("ค้นคว้า")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "🔍 ทำงานวิจัย เก็บข้อมูล วิเคราะห์ผล และเขียนบทความทางวิชาการ" 
      };
    }
    else if (lowerText.includes("วิทยานิพนธ์") || lowerText.includes("thesis") || lowerText.includes("ปริญญานิพนธ์")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "🎓 ทำงานวิทยานิพนธ์ ปรึกษาอาจารย์ที่ปรึกษาเป็นประจำ จัดการเวลาเขียนบทต่างๆ" 
      };
    }
    else if (lowerText.includes("ฝึกงาน") || lowerText.includes("intern") || lowerText.includes("ฝึกงาน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "💼 เตรียมตัวฝึกงาน อัพเดทรายละเอียดประวัติส่วนตัว ศึกษาข้อมูลเกี่ยวกับองค์กร" 
      };
    }

    // ==================== หมวดหมู่: งาน ====================
    else if (lowerText.includes("ประชุม") || lowerText.includes("meeting") || lowerText.includes("มีตติ้ง")) {
      suggestion = { 
        category: "งาน", 
        priority: "high", 
        description: "👥 เตรียมเอกสารและหัวข้อสำคัญสำหรับการประชุมทีม จดบันทึกข้อสรุปการประชุม" 
      };
    }
    else if (lowerText.includes("ประชุมลูกค้า") || lowerText.includes("client meeting") || lowerText.includes("พบลูกค้า")) {
      suggestion = { 
        category: "งาน", 
        priority: "high", 
        description: "🤝 เตรียม presentation สำหรับลูกค้า ศึกษาความต้องการและเสนอแนวทางแก้ไข" 
      };
    }
    else if (lowerText.includes("รายงาน") || lowerText.includes("report") || lowerText.includes("สรุปงาน")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "📈 รวบรวมข้อมูลและเขียนรายงานให้ครบถ้วน วิเคราะห์ข้อมูลและเสนอแนะแนวทางพัฒนางาน" 
      };
    }
    else if (lowerText.includes("ส่งเมล") || lowerText.includes("email") || lowerText.includes("อีเมล") || lowerText.includes("ตอบเมล")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "📧 ตอบอีเมลและจัดการเรื่องด่วนในการทำงาน ตรวจสอบความถูกต้องก่อนส่ง" 
      };
    }
    else if (lowerText.includes("ติดต่อ") || lowerText.includes("ลูกค้า") || lowerText.includes("client") || lowerText.includes("customer")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "📞 ติดต่อลูกค้าและประสานงานเรื่องต่างๆ เตรียมข้อมูลให้พร้อมก่อนติดต่อ" 
      };
    }
    else if (lowerText.includes("โปรเจค") || lowerText.includes("project") || lowerText.includes("โครงการ")) {
      suggestion = { 
        category: "งาน", 
        priority: "high", 
        description: "📂 จัดการโปรเจคและมอบหมายงานให้ทีม ติดตามความคืบหน้าอย่างสม่ำเสมอ" 
      };
    } 
    else if (lowerText.includes("วางแผน") || lowerText.includes("plan") || lowerText.includes("จัดการเวลา") || lowerText.includes("schedule")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "🗓️ วางแผนและจัดการเวลาให้มีประสิทธิภาพ กำหนดเป้าหมายและระยะเวลาที่ชัดเจน" 
      };
    }
    else if (lowerText.includes("ฝึกอบรม") || lowerText.includes("training") || lowerText.includes("workshop") || lowerText.includes("สัมมนา")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "📚 เตรียมตัวฝึกอบรมและศึกษาหาความรู้เพิ่มเติม นำความรู้ไปประยุกต์ใช้ในการทำงาน" 
      };
    }
    else if (lowerText.includes("present") || lowerText.includes("พรีเซนต์") || lowerText.includes("นำเสนอ")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "🎯 เตรียมการนำเสนองาน ฝึกซ้อมและปรับปรุงเนื้อหาให้เหมาะสมกับกลุ่มผู้ฟัง" 
      };
    }
    else if (lowerText.includes("วิเคราะห์") || lowerText.includes("analyze") || lowerText.includes("analysis")) {
      suggestion = { 
        category: "งาน", 
        priority: "high", 
        description: "🔍 วิเคราะห์ข้อมูลและสถานการณ์ต่างๆ เพื่อหาแนวทางพัฒนางานและตัดสินใจ" 
      };
    }
    else if (lowerText.includes("ออกแบบ") || lowerText.includes("design") || lowerText.includes("ดีไซน์")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "🎨 ออกแบบงานสร้างสรรค์ ศึกษาความต้องการลูกค้าและพัฒนาแนวคิด" 
      };
    }
    else if (lowerText.includes("พัฒนาระบบ") || lowerText.includes("develop") || lowerText.includes("programming")) {
      suggestion = { 
        category: "งาน", 
        priority: "high", 
        description: "💻 พัฒนาระบบและซอฟต์แวร์ ทดสอบและแก้ไขบั๊กก่อนส่งมอบงาน" 
      };
    }
    else if (lowerText.includes("ตรวจสอบ") || lowerText.includes("review") || lowerText.includes("quality control")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "✅ ตรวจสอบคุณภาพงาน เปรียบเทียบกับมาตรฐานและข้อกำหนดที่กำหนด" 
      };
    }

    // ==================== หมวดหมู่: ออกกำลังกาย ====================
    else if (lowerText.includes("ออกกำลัง") || lowerText.includes("exercise") || lowerText.includes("ฟิต") ||
             lowerText.includes("ฟิตเนส") || lowerText.includes("fitness") || lowerText.includes("ยิม") ||
             lowerText.includes("gym") || lowerText.includes("workout") || lowerText.includes("เวิร์คเอาท์")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "💪 ไปยิมหรือออกกำลังกายเพื่อสุขภาพที่ดี สร้างกล้ามเนื้อและความแข็งแรงของร่างกาย" 
      };
    }
    else if (lowerText.includes("วิ่ง") || lowerText.includes("running") || lowerText.includes("run") ||
             lowerText.includes("จ๊อก") || lowerText.includes("จ๊อกกิ้ง") || lowerText.includes("jogging") ||
             lowerText.includes("มาราธอน") || lowerText.includes("marathon") || lowerText.includes("ฮาล์ฟ")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🏃‍♂️ ไปวิ่งออกกำลังกายสัก 30-45 นาที เพื่อระบบหัวใจที่แข็งแรงและเผาผลาญแคลอรี่" 
      };
    }
    else if (lowerText.includes("เวท") || lowerText.includes("weight") || lowerText.includes("ยกน้ำหนัก") ||
             lowerText.includes("ยกเวท") || lowerText.includes("bench press") || lowerText.includes("เบนช์เพรส") ||
             lowerText.includes("squat") || lowerText.includes("สควอต") || 
             lowerText.includes("deadlift") || lowerText.includes("เดดลิฟต์")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🏋️‍♂️ ออกกำลังกายด้วยเวทเทรนนิ่ง เน้นเทคนิคและท่าทางที่ถูกต้องเพื่อป้องกันการบาดเจ็บ" 
      };
    }
    else if (lowerText.includes("ว่าย") || lowerText.includes("ว่ายน้ำ") || lowerText.includes("swim") ||
             lowerText.includes("swimming") || lowerText.includes("สระว่ายน้ำ") || lowerText.includes("pool")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🏊‍♂️ ไปว่ายน้ำเพื่อฝึกกล้ามเนื้อทั้งตัวและระบบหายใจ เป็นการออกกำลังกายที่เหมาะกับทุกวัย" 
      };
    }
    else if (lowerText.includes("โยคะ") || lowerText.includes("yoga") || 
             lowerText.includes("พิลาทิส") || lowerText.includes("pilates") ||
             lowerText.includes("meditation") || lowerText.includes("สมาธิ") || lowerText.includes("ฌาน")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🧘‍♀️ ทำโยคะหรือพิลาทิสเพื่อความยืดหยุ่นและจิตใจสงบ ช่วยลดความเครียดและเพิ่มสมาธิ" 
      };
    }
    else if (lowerText.includes("ปั่น") || lowerText.includes("ปั่นจักรยาน") || lowerText.includes("cycling") ||
             lowerText.includes("bike") || lowerText.includes("จักรยาน") || lowerText.includes("ขี่จักรยาน") ||
             lowerText.includes("เสือภูเขา") || lowerText.includes("mountain bike") ||
             lowerText.includes("road bike") || lowerText.includes("spinning") || lowerText.includes("สปินนิ่ง")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🚴‍♂️ ปั่นจักรยานออกกำลังกาย สนุกและดีต่อหัวเข่า ช่วยเสริมสร้างความแข็งแรงของขา" 
      };
    }
    // ==================== หมวดหมู่: อีเวนต์/งานกิจกรรมพิเศษ ====================
    // คอนเสิร์ต
    else if (lowerText.includes("คอนเสิร์ต") || lowerText.includes("concert") || lowerText.includes("concerts")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "high", 
        description: "🎶 ไปคอนเสิร์ต เตรียมซื้อตั๋วล่วงหน้า จองที่นั่ง และสนุกกับเสียงเพลงจากศิลปินที่ชอบ" 
      };
    }

    // เทศกาล/งานแฟร์
    else if (lowerText.includes("เทศกาล") || lowerText.includes("festival") || lowerText.includes("fair") || 
            lowerText.includes("งานแฟร์")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🎉 เข้าร่วมงานเทศกาลหรืองานแฟร์ สนุกกับกิจกรรม ดนตรี อาหาร และบรรยากาศพิเศษ" 
      };
    }

    // งานแสดงสินค้า/เอ็กซ์โป
    else if (lowerText.includes("งานแสดงสินค้า") || lowerText.includes("expo") || lowerText.includes("exhibition")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "🏢 เข้าชมงานแสดงสินค้า/เอ็กซ์โป อัปเดตเทรนด์ใหม่ๆ และสร้างโอกาสในการเชื่อมต่อธุรกิจ" 
      };
    }

    // งานแต่งงาน
    else if (lowerText.includes("งานแต่ง") || lowerText.includes("wedding")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "high", 
        description: "💍 ไปร่วมงานแต่งงาน เตรียมของขวัญและแต่งกายสุภาพเพื่อแสดงความยินดีแก่คู่บ่าวสาว" 
      };
    }

    // งานประชุม/สัมมนา
    else if (lowerText.includes("สัมมนา") || lowerText.includes("ประชุม") || lowerText.includes("conference") || 
            lowerText.includes("seminar")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "📢 เข้าร่วมประชุมหรือสัมมนา เตรียมสมุดบันทึกและตั้งใจเรียนรู้เพื่อพัฒนาความรู้ใหม่ๆ" 
      };
    }

    // ==================== หมวดหมู่: กิจกรรมกลุ่ม/แคมป์ ====================

    // เอ้าท์ติ้ง
    else if (lowerText.includes("เอ้าท์ติ้ง") || lowerText.includes("outing") || lowerText.includes("เอ้าติ้ง")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🏞️ ไปเอ้าท์ติ้งกับทีมหรือบริษัท เตรียมตัวพร้อมสำหรับกิจกรรมกลุ่มและสร้างความสัมพันธ์ที่ดี" 
      };
    }

    // ตั้งแคมป์/แคมป์ปิ้ง
    else if (lowerText.includes("ตั้งแคมป์") || lowerText.includes("camping") || lowerText.includes("แคมป์") ||
            lowerText.includes("เต้นท์") || lowerText.includes("tent") || lowerText.includes("ตั้งเต้นท์")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "⛺ ไปตั้งแคมป์ เตรียมอุปกรณ์เต้นท์ ถุงนอน โคมไฟ และอาหารแห้ง เพื่อประสบการณ์ธรรมชาติที่น่าจดจำ" 
      };
    }

    // งานกลุ่ม/ทีมบิลดิ้ง
    else if (lowerText.includes("งานกลุ่ม") || lowerText.includes("group work") || lowerText.includes("group project") ||
            lowerText.includes("กิจกรรมกลุ่ม") || lowerText.includes("team building") || lowerText.includes("ทีมบิลดิ้ง") ||
            lowerText.includes("ทำงานร่วมกัน") || lowerText.includes("collaborate")) {
      suggestion = { 
        category: "งาน", 
        priority: "medium", 
        description: "👥 ทำงานกลุ่มหรือกิจกรรมทีมบิลดิ้ง แบ่งหน้าที่ชัดเจน ประสานงานและสื่อสารอย่างมีประสิทธิภาพ" 
      };
    }

    // ค่ายพักแรม
    else if (lowerText.includes("ค่ายพักแรม") || lowerText.includes("พักแรม")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🏕️ เข้าค่ายพักแรม เตรียมอุปกรณ์นอนกลางแจ้ง เสื้อผ้า และอาหารสำหรับกิจกรรมกลางแจ้ง" 
      };
    }

    // ค่ายลูกเสือ
    else if (lowerText.includes("ค่ายลูกเสือ") || lowerText.includes("scout") || lowerText.includes("ลูกเสือ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🎖️ เข้าค่ายลูกเสือ เตรียมชุดลูกเสือ อุปกรณ์ผูกเงื่อน และเรียนรู้ทักษะการอยู่ร่วมกัน" 
      };
    }

    // รีทรีต
    else if (lowerText.includes("retreat") || lowerText.includes("รีทรีต")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🧘 ไปรีทรีตเพื่อพักผ่อนจิตใจ ผ่อนคลายความเครียด และสร้างพลังงานใหม่ให้กับตัวเอง" 
      };
    }

    // ค่ายภาษา
    else if (lowerText.includes("ค่ายภาษา")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "🗣️ เข้าค่ายภาษาเพื่อพัฒนาทักษะการสื่อสารและเรียนรู้ภาษาใหม่อย่างเข้มข้น" 
      };
    }

    // ค่ายกีฬา
    else if (lowerText.includes("ค่ายกีฬา")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "medium", 
        description: "⚽ เข้าค่ายกีฬาเพื่อฝึกฝนทักษะ พัฒนาร่างกาย และเรียนรู้การทำงานเป็นทีม" 
      };
    }

    // ค่ายทั่วไป (สำหรับคำว่า "ค่าย" หรือ "เข้าค่าย" ที่ไม่ระบุประเภท)
    else if (lowerText.includes("เข้าค่าย") || lowerText.includes("ไปค่าย") || 
            (lowerText.includes("ค่าย") && !lowerText.includes("camp"))) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🏕️ เข้าค่าย เตรียมอุปกรณ์และเสื้อผ้าให้เหมาะสมกับกิจกรรม พร้อมเรียนรู้สิ่งใหม่ๆ" 
      };
    }
    else if (lowerText.includes("เต้น") || lowerText.includes("dance") || lowerText.includes("แอโร") ||
             lowerText.includes("aerobic") || lowerText.includes("แอโรบิค") || 
             lowerText.includes("ซุมบ้า") || lowerText.includes("zumba") ||
             lowerText.includes("hiphop") || lowerText.includes("ฮิปฮอป")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "💃 เต้นออกกำลังกายเพื่อความสนุก เผาผลาญแคลอรี่และเสริมสร้างความมั่นใจ" 
      };
    }
    else if (lowerText.includes("มวย") || lowerText.includes("boxing") || lowerText.includes("ต่อย") || lowerText.includes("muay thai")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🥊 ฝึกมวยหรือออกกำลังกายด้วยการต่อย เพื่อพัฒนาความแข็งแรงและเรียนรู้การป้องกันตัว" 
      };
    }
    else if (lowerText.includes("ฟุตบอล") || lowerText.includes("soccer") || lowerText.includes("บอล") || lowerText.includes("football")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "⚽ เล่นฟุตบอลกับเพื่อนๆ พัฒนาทักษะการทำงานเป็นทีมและความว่องไว" 
      };
    }
    else if (lowerText.includes("บาสเกตบอล") || lowerText.includes("basketball") || lowerText.includes("บาส")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🏀 เล่นบาสเกตบอลเพื่อความสนุก พัฒนาความแม่นยำและความคล่องตัว" 
      };
    }
    else if (lowerText.includes("แบดมินตัน") || lowerText.includes("badminton") || lowerText.includes("แบด") || lowerText.includes("ตีก๊วน")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🏸 เล่นแบดมินตันเพื่อความสนุก พัฒนาความว่องไวและสายตา" 
      };
    }
    else if (lowerText.includes("เทนนิส") || lowerText.includes("tennis") || lowerText.includes("ตีเทนนิส")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🎾 เล่นเทนนิสเพื่อความสนุก พัฒนาความแข็งแรงและความแม่นยำ" 
      };
    }
    else if (lowerText.includes("ปิงปอง") || lowerText.includes("ping pong") || lowerText.includes("เทเบิลเทนนิส")) {
      suggestion = { 
        category: "ออกกำลังกาย", 
        priority: "low", 
        description: "🏓 เล่นปิงปองเพื่อความสนุก พัฒนาความว่องไวและสมาธิ" 
      };
    }
    else if (lowerText.includes("เดิน") || lowerText.includes("walk") || lowerText.includes("เดินเล่น") || lowerText.includes("เดินออกกำลัง")) {
      suggestion = { 
        category: "ออกกำลังกาย",
        priority: "low", 
        description: "🚶‍♂️ เดินเล่นเพื่อสุขภาพ เริ่มจาก 30 นาทีต่อวันเพื่อสุขภาพหัวใจที่ดี" 
      };
    }
    else if (lowerText.includes("ปีนเขา") || lowerText.includes("hiking") || lowerText.includes("เดินป่า") || lowerText.includes("trekking")) {
      suggestion = { 
        category: "ออกกำลังกาย",
        priority: "low", 
        description: "⛰️ ปีนเขาหรือเดินป่าเพื่อสุขภาพและสัมผัสธรรมชาติ เตรียมอุปกรณ์ให้พร้อม" 
      };
    }
    else if (lowerText.includes("โยคะร้อน") || lowerText.includes("hot yoga") || lowerText.includes("บิกราม")) {
      suggestion = { 
        category: "ออกกำลังกาย",
        priority: "low", 
        description: "🔥 ฝึกโยคะร้อนเพื่อการขับถ่ายของเสียและเพิ่มความยืดหยุ่นของร่างกาย" 
      };
    }

    // ==================== หมวดหมู่: ส่วนตัว ====================
    else if (lowerText.includes("บ้าน") || lowerText.includes("home") || 
             lowerText.includes("clean") || lowerText.includes("ทำความสะอาด") ||
             lowerText.includes("กวาด") || lowerText.includes("ถู") || 
             lowerText.includes("ซัก") || lowerText.includes("ซักผ้า") || lowerText.includes("laundry") ||
             lowerText.includes("รีด") || lowerText.includes("รีดผ้า") || lowerText.includes("ironing") ||
             lowerText.includes("จัด") || lowerText.includes("จัดบ้าน") || lowerText.includes("organize") ||
             lowerText.includes("ตกแต่ง") || lowerText.includes("decorate") ||
             lowerText.includes("ซ่อม") || lowerText.includes("repair") || lowerText.includes("fix") ||
             lowerText.includes("จ้าง")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🏠 ทำความสะอาดบ้าน จัดระเบียบ ซักรีดผ้า ซ่อมแซมของใช้ เพื่อสภาพแวดล้อมที่น่าอยู่" 
      };
    }
    else if (lowerText.includes("ซื้อของ") || lowerText.includes("shopping") || lowerText.includes("ช้อป") ||
             lowerText.includes("ช้อปปิ้ง") || lowerText.includes("ห้าง") || lowerText.includes("ห้างสรรพสินค้า") ||
             lowerText.includes("mall") || lowerText.includes("ตลาด") || lowerText.includes("market") ||
             lowerText.includes("ซุปเปอร์มาร์เก็ต") || lowerText.includes("supermarket") ||
             lowerText.includes("คอนวีเนียนสโตร์") || lowerText.includes("เซเว่น")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🛒 ไปซื้อของใช้จำเป็น อาหาร และสิ่งของที่ขาด เตรียมรายการสินค้าล่วงหน้า" 
      };
    }
    else if (lowerText.includes("กินข้าว") || lowerText.includes("อาหาร") || lowerText.includes("breakfast") ||
             lowerText.includes("อาหารเช้า") || lowerText.includes("lunch") || lowerText.includes("อาหารเที่ยง") ||
             lowerText.includes("dinner") || lowerText.includes("อาหารเย็น") ||
             lowerText.includes("ทำอาหาร") || lowerText.includes("cooking") || 
             lowerText.includes("ทำขนม") || lowerText.includes("baking") || lowerText.includes("อบ") ||
             lowerText.includes("ร้านอาหาร") || lowerText.includes("restaurant") || lowerText.includes("จองร้าน") ||
             lowerText.includes("buffet") || lowerText.includes("บุฟเฟ่ต์") ||
             lowerText.includes("cafe") || lowerText.includes("คาเฟ่") || 
             lowerText.includes("กาแฟ") || lowerText.includes("coffee")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🍽️ ไปกินข้าว ทำอาหาร ทำขนม หรือนั่งคาเฟ่ดื่มกาแฟ เพื่อความสุขและผ่อนคลาย" 
      };
    }
    else if (lowerText.includes("นัดเพื่อน") || lowerText.includes("friend") || lowerText.includes("เพื่อน") ||
             lowerText.includes("พบเพื่อน") || lowerText.includes("เจอเพื่อน") ||
             lowerText.includes("party") || lowerText.includes("ปาร์ตี้") || lowerText.includes("งานเลี้ยง") ||
             lowerText.includes("gathering") || lowerText.includes("date") || lowerText.includes("เดท") ||
             lowerText.includes("ครอบครัว") || lowerText.includes("family")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "☕ นัดพบปะเพื่อน ครอบครัว หรือร่วมงานเลี้ยง สังสรรค์ เพื่อรักษาความสัมพันธ์ที่ดี" 
      };
    }
    else if (lowerText.includes("หนัง") || lowerText.includes("movie") || lowerText.includes("ดูหนัง") ||
             lowerText.includes("โรงหนัง") || lowerText.includes("cinema") ||
             lowerText.includes("ซีรีย์") || lowerText.includes("series") || 
             lowerText.includes("netflix") || lowerText.includes("เน็ตฟลิกซ์") ||
             lowerText.includes("คอนเสิร์ต") || lowerText.includes("concert") ||
             lowerText.includes("แสดง") || lowerText.includes("show") || lowerText.includes("ละคร")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🎬 ดูหนัง ซีรีย์ คอนเสิร์ต หรือการแสดงเพื่อพักผ่อนและความบันเทิง" 
      };
    }
    else if (lowerText.includes("อ่านหนังสือ") || lowerText.includes("reading") || lowerText.includes("นิยาย") ||
             lowerText.includes("novel") || lowerText.includes("มังงะ") || lowerText.includes("manga") ||
             lowerText.includes("comic") || lowerText.includes("การ์ตูน") ||
             lowerText.includes("ร้านหนังสือ") || lowerText.includes("bookstore") ||
             lowerText.includes("ห้องสมุด") || lowerText.includes("library")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "📖 อ่านหนังสือ นิยาย มังงะ เพื่อความเพลิดเพลินและความรู้ พัฒนาตนเองอย่างต่อเนื่อง" 
      };
    }
    else if (lowerText.includes("เล่นเกม") || lowerText.includes("game") || lowerText.includes("gaming") ||
             lowerText.includes("วีดีโอเกม") || lowerText.includes("console") || lowerText.includes("คอนโซล") ||
             lowerText.includes("pc") || lowerText.includes("คอมพิวเตอร์") || 
             lowerText.includes("มือถือ") || lowerText.includes("mobile game") ||
             lowerText.includes("แข่งเกม") || lowerText.includes("tournament") ||
             lowerText.includes("stream") || lowerText.includes("สตรีม")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🎮 เล่นเกมเพื่อผ่อนคลายความเครียด ไม่เกินเวลาที่กำหนด เพื่อสมดุลระหว่างงานและชีวิต" 
      };
    }
    else if (lowerText.includes("นอน") || lowerText.includes("sleep") || lowerText.includes("หลับ") ||
             lowerText.includes("พักผ่อน") || lowerText.includes("rest") || lowerText.includes("relax") ||
             lowerText.includes("ผ่อนคลาย") || lowerText.includes("งีบ") || 
             lowerText.includes("nap") || lowerText.includes("นอนกลางวัน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "😴 นอนหลับพักผ่อนให้เพียงพอ อย่างน้อย 7-8 ชั่วโมง เพื่อสุขภาพร่างกายและจิตใจที่ดี" 
      };
    }
    else if (lowerText.includes("ฟังเพลง") || lowerText.includes("music") || lowerText.includes("เพลง") ||
             lowerText.includes("ดนตรี") || lowerText.includes("เล่นดนตรี") || 
             lowerText.includes("instrument") || lowerText.includes("เครื่องดนตรี") ||
             lowerText.includes("กีตาร์") || lowerText.includes("guitar") ||
             lowerText.includes("เปียโน") || lowerText.includes("piano") ||
             lowerText.includes("ร้องเพลง") || lowerText.includes("singing") ||
             lowerText.includes("คาราโอเกะ") || lowerText.includes("karaoke")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🎧 ฟังเพลง เล่นดนตรี ร้องเพลง หรือไปคาราโอเกะ เพื่อความผ่อนคลายและพัฒนาความคิดสร้างสรรค์" 
      };
    }
    else if (lowerText.includes("เที่ยว") || lowerText.includes("travel") || lowerText.includes("ท่องเที่ยว") ||
             lowerText.includes("เดินทาง") || lowerText.includes("trip") || lowerText.includes("ทริป") ||
             lowerText.includes("vacation") || lowerText.includes("พักร้อน") ||
             lowerText.includes("ทะเล") || lowerText.includes("beach") || lowerText.includes("ชายหาด") ||
             lowerText.includes("เกาะ") || lowerText.includes("island") ||
             lowerText.includes("ภูเขา") || lowerText.includes("mountain") ||
             lowerText.includes("ต่างจังหวัด") || lowerText.includes("ต่างประเทศ") || lowerText.includes("abroad") ||
             lowerText.includes("จองตั๋ว") || lowerText.includes("ticket") || 
             lowerText.includes("จองที่พัก") || lowerText.includes("โรงแรม") || lowerText.includes("hotel") ||
             lowerText.includes("รีสอร์ท") || lowerText.includes("resort")) {
      suggestion = { 
        category: "ส่วนตัว",
        priority: "low", 
        description: "✈️ วางแผนเที่ยว จองตั๋วและที่พัก เตรียมตัวสำหรับการท่องเที่ยว เพื่อเติมพลังงานและประสบการณ์ใหม่" 
      };
    }
    else if (lowerText.includes("วันเกิด") || lowerText.includes("birthday") || 
             lowerText.includes("ครบรอบ") || lowerText.includes("anniversary") ||
             lowerText.includes("งานแต่ง") || lowerText.includes("wedding") || lowerText.includes("แต่งงาน") ||
             lowerText.includes("celebration") || lowerText.includes("ฉลอง")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🎉 เตรียมของขวัญ จัดงาน อวยพร หรือร่วมงานฉลอง เพื่อแสดงความยินดีและรักษาความสัมพันธ์" 
      };
    }
    else if (lowerText.includes("สัตว์เลี้ยง") || lowerText.includes("pet") ||
             lowerText.includes("สุนัข") || lowerText.includes("dog") || lowerText.includes("พาหมาเดินเล่น") ||
             lowerText.includes("แมว") || lowerText.includes("cat") ||
             lowerText.includes("สัตว์แพทย์") || lowerText.includes("vet") ||
             lowerText.includes("grooming") || lowerText.includes("อาบน้ำสุนัข")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🐕 ดูแลสัตว์เลี้ยง พาเดินเล่น อาบน้ำ หรือพบสัตว์แพทย์ เพื่อสุขภาพและความสุขของสัตว์เลี้ยง" 
      };
    }
    else if (lowerText.includes("ปลูกต้นไม้") || lowerText.includes("gardening") || lowerText.includes("สวน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🌱 ปลูกต้นไม้และดูแลสวน เพื่อความสวยงามและสภาพแวดล้อมที่ดี" 
      };
    }
    else if (lowerText.includes("ทำสมาธิ") || lowerText.includes("meditation") || lowerText.includes("นั่งสมาธิ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🧘 ฝึกทำสมาธิเพื่อความสงบใจและพัฒนาสมาธิ เริ่มจากวันละ 10-15 นาที" 
      };
    }

    // ==================== กรณีพิเศษ ====================
    else if (lowerText.includes("ด่วน") || lowerText.includes("urgent") || lowerText.includes("สำคัญ") || lowerText.includes("emergency")) {
      suggestion = { 
        category: "งาน", 
        priority: "high", 
        description: "🚀 งานด่วน! ควรจัดการให้เสร็จโดยเร็ว วางแผนการทำงานและขอความช่วยเหลือหากจำเป็น" 
      };
    }
    else if (lowerText.includes("สุขภาพ") || lowerText.includes("health") ||
             lowerText.includes("หมอ") || lowerText.includes("doctor") || lowerText.includes("แพทย์") ||
             lowerText.includes("นัดหมอ") || lowerText.includes("โรงพยาบาล") || lowerText.includes("hospital") ||
             lowerText.includes("คลินิก") || lowerText.includes("clinic") ||
             lowerText.includes("ตรวจ") || lowerText.includes("checkup") || lowerText.includes("ตรวจสุขภาพ") ||
             lowerText.includes("ตรวจเลือด") || lowerText.includes("blood test") ||
             lowerText.includes("xray") || lowerText.includes("เอกซเรย์") ||
             lowerText.includes("ทันตกรรม") || lowerText.includes("dental") || lowerText.includes("ฟัน") ||
             lowerText.includes("หมอฟัน") || lowerText.includes("dentist") ||
             lowerText.includes("ถอนฟัน") || lowerText.includes("อุดฟัน") || lowerText.includes("filling") ||
             lowerText.includes("ขูดหินปูน") || lowerText.includes("scaling") ||
             lowerText.includes("จัดฟัน") || lowerText.includes("braces") ||
             lowerText.includes("ยา") || lowerText.includes("medicine") ||
             lowerText.includes("ร้านยา") || lowerText.includes("pharmacy") ||
             lowerText.includes("ฉีด") || lowerText.includes("vaccination") ||
             lowerText.includes("วัคซีน") || lowerText.includes("vaccine") ||
             lowerText.includes("นวด") || lowerText.includes("massage") || lowerText.includes("นวดไทย") ||
             lowerText.includes("สปา") || lowerText.includes("spa") ||
             lowerText.includes("ความงาม") || lowerText.includes("beauty") ||
             lowerText.includes("ร้านเสริมสวย") || lowerText.includes("salon") ||
             lowerText.includes("ตัดผม") || lowerText.includes("haircut") || lowerText.includes("ทำผม") ||
             lowerText.includes("ทำเล็บ") || lowerText.includes("manicure") || lowerText.includes("pedicure") ||
             lowerText.includes("เล็บมือ") || lowerText.includes("เล็บเท้า")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "high", 
        description: "🏥 พบแพทย์ ตรวจสุขภาพ นัดหมอฟัน ซื้อยา นวด หรือดูแลความงาม เพื่อสุขภาพร่างกายและจิตใจที่ดี" 
      };
    }
    else if (lowerText.includes("ธนาคาร") || lowerText.includes("bank") || lowerText.includes("การเงิน") ||
             lowerText.includes("atm") || lowerText.includes("ถอนเงิน") || lowerText.includes("โอนเงิน") ||
             lowerText.includes("จ่ายบิล") || lowerText.includes("บิล") || lowerText.includes("ค่าน้ำ") ||
             lowerText.includes("ค่าไฟ") || lowerText.includes("ค่าเน็ต") || lowerText.includes("ค่าโทรศัพท์")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "💰 จัดการเรื่องการเงิน ธนาคาร จ่ายบิลต่างๆ เพื่อการจัดการเงินที่เหมาะสม" 
      };
    }
    else if (lowerText.includes("รถ") || lowerText.includes("car") || lowerText.includes("ขับรถ") ||
             lowerText.includes("ล้างรถ") || lowerText.includes("เช็ครถ") || lowerText.includes("ซ่อมรถ") ||
             lowerText.includes("เปลี่ยนถ่ายน้ำมัน") || lowerText.includes("ต่อภาษี") || lowerText.includes("ต่อทะเบียน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🚗 จัดการเรื่องรถยนต์ ล้างรถ เช็คสภาพ ซ่อมบำรุง เพื่อความปลอดภัยในการเดินทาง" 
      };
    }
    else if (lowerText.includes("อ่านหนังสือพัฒนาตนเอง") || lowerText.includes("self improvement") || lowerText.includes("พัฒนาทักษะ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "📈 อ่านหนังสือพัฒนาตนเองเพื่อเพิ่มพูนความรู้และพัฒนาทักษะชีวิตใหม่ๆ" 
      };
    }
        else if (lowerText.includes("สอบไฟนอล") || lowerText.includes("final") || lowerText.includes("สอบปลายภาค")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "🎯 เตรียมตัวสอบไฟนอล อ่านสรุปเนื้อหาทั้งเทอม ทำโจทย์เก่าๆ เพื่อความคุ้นเคย" 
      };
    }
    else if (lowerText.includes("สอบมิดเทอม") || lowerText.includes("midterm") || lowerText.includes("สอบกลางภาค")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "📝 เตรียมสอบมิดเทอม ทบทวนเนื้อหาครึ่งแรกของเทอม จดโน้ตสำคัญ" 
      };
    }
    else if (lowerText.includes("ส่งงาน") || lowerText.includes("assignment") || lowerText.includes("homework") || lowerText.includes("การบ้าน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "✍️ เร่งทำงานให้เสร็จทันตามกำหนดส่ง ตรวจสอบ requirement ให้ครบถ้วน" 
      };
    }
    else if (lowerText.includes("โปรเจค") || lowerText.includes("project") || lowerText.includes("โครงงาน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "📁 จัดการโปรเจค จัดทำ timeline กำหนดหน้าที่รับผิดชอบของสมาชิกในทีม" 
      };
    }
    else if (lowerText.includes("present") || lowerText.includes("นำเสนอ") || lowerText.includes("พรีเซ้น") || lowerText.includes("presentation")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "🎤 เตรียมสไลด์และฝึกซ้อมการนำเสนอ จับเวลาการพูดให้เหมาะสม" 
      };
    }
    else if (lowerText.includes("เรียน") || lowerText.includes("lecture") || lowerText.includes("คาบ") || lowerText.includes("class")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "📖 เตรียมตัวเข้าเรียนและจดบันทึกเนื้อหาสำคัญ อ่านล่วงหน้าสำหรับคาบถัดไป" 
      };
    }
    else if (lowerText.includes("ติว") || lowerText.includes("tutor") || lowerText.includes("สอนเพื่อน") || lowerText.includes("ทบทวน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "👨‍🏫 อ่านหนังสือเตรียมตัวไปติวหรือสอนเพื่อนๆ เตรียมโจทย์และตัวอย่าง" 
      };
    }
    else if (lowerText.includes("แลป") || lowerText.includes("lab") || lowerText.includes("ปฏิบัติการ") || lowerText.includes("laboratory")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "🔬 เตรียมอุปกรณ์แลป อ่านคู่มือการทดลองล่วงหน้า จดบันทึกผลการทดลอง" 
      };
    }
    else if (lowerText.includes("รายงาน") || lowerText.includes("report") || lowerText.includes("เขียนรายงาน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "📊 รวบรวมข้อมูลและเขียนรายงานให้ครบถ้วน ตรวจสอบการอ้างอิงให้ถูกต้อง" 
      };
    }
    else if (lowerText.includes("วิจัย") || lowerText.includes("research") || lowerText.includes("ค้นคว้า")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "🔍 ทำงานวิจัย เก็บข้อมูล วิเคราะห์ผล และเขียนบทความทางวิชาการ" 
      };
    }
    else if (lowerText.includes("วิทยานิพนธ์") || lowerText.includes("thesis") || lowerText.includes("ปริญญานิพนธ์")) {
      suggestion = { 
        category: "เรียน", 
        priority: "high", 
        description: "🎓 ทำงานวิทยานิพนธ์ ปรึกษาอาจารย์ที่ปรึกษาเป็นประจำ จัดการเวลาเขียนบทต่างๆ" 
      };
    }
    else if (lowerText.includes("ฝึกงาน") || lowerText.includes("intern") || lowerText.includes("ฝึกงาน")) {
      suggestion = { 
        category: "เรียน", 
        priority: "medium", 
        description: "💼 เตรียมตัวฝึกงาน อัพเดทรายละเอียดประวัติส่วนตัว ศึกษาข้อมูลเกี่ยวกับองค์กร" 
      };
    }

    else if (lowerText.includes("เรียนภาษา") || lowerText.includes("language learning") || lowerText.includes("คอร์สภาษา")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🌍 เรียนภาษาต่างประเทศเพื่อพัฒนาทักษะการสื่อสารและเปิดโอกาสใหม่ๆ ในชีวิต" 
      };
    }
    else if (lowerText.includes("ฝึกพูดในที่สาธารณะ") || lowerText.includes("public speaking") || lowerText.includes("presentation skill")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🎤 ฝึกทักษะการพูดในที่สาธารณะเพื่อเพิ่มความมั่นใจและประสิทธิภาพในการสื่อสาร" 
      };
    }

    // ==================== หมวดหมู่: เทคโนโลยี ====================
    else if (lowerText.includes("อัพเกรดคอมพิวเตอร์") || lowerText.includes("upgrade computer") || lowerText.includes("ซ่อมคอม")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "💻 อัพเกรดหรือซ่อมคอมพิวเตอร์เพื่อเพิ่มประสิทธิภาพการทำงาน" 
      };
    }
    else if (lowerText.includes("แบ็คอัพข้อมูล") || lowerText.includes("backup data") || lowerText.includes("สำรองข้อมูล")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "💾 สำรองข้อมูลสำคัญเพื่อป้องกันการสูญหายจากอุปกรณ์เสียหาย" 
      };
    }
    else if (lowerText.includes("ตั้งค่าเครือข่าย") || lowerText.includes("network setup") || lowerText.includes("อินเทอร์เน็ต")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "📡 ตั้งค่าเครือข่ายอินเทอร์เน็ตหรือแก้ไขปัญหาการเชื่อมต่อ" 
      };
    }

    // ==================== หมวดหมู่: สิ่งแวดล้อม ====================
    else if (lowerText.includes("รีไซเคิล") || lowerText.includes("recycle") || lowerText.includes("คัดแยกขยะ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "♻️ คัดแยกขยะรีไซเคิลเพื่อรักษาสิ่งแวดล้อมและลดปริมาณขยะ" 
      };
    }
    else if (lowerText.includes("ปลูกป่า") || lowerText.includes("reforestation") || lowerText.includes("ต้นไม้")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🌳 ไปปลูกป่าหรือต้นไม้เพื่อช่วยฟื้นฟูระบบนิเวศและสิ่งแวดล้อม" 
      };
    }
    else if (lowerText.includes("ทำความสะอาดชายหาด") || lowerText.includes("beach cleanup") || lowerText.includes("เก็บขยะ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🏖️ ไปทำความสะอาดชายหาดหรือพื้นที่สาธารณะเพื่อรักษาสิ่งแวดล้อม" 
      };
    }

    // ==================== หมวดหมู่: ศิลปะและงานฝีมือ ====================
    else if (lowerText.includes("วาดรูป") || lowerText.includes("drawing") || lowerText.includes("painting")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🎨 ทำงานศิลปะเช่นวาดรูปหรือระบายสีเพื่อพัฒนาความคิดสร้างสรรค์" 
      };
    }
    else if (lowerText.includes("ทำอาหาร") || lowerText.includes("cooking") || lowerText.includes("สูตรอาหาร")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "👨‍🍳 ฝึกทำอาหารหรือลองสูตรอาหารใหม่ๆ เพื่อพัฒนาทักษะการทำอาหาร" 
      };
    }
    else if (lowerText.includes("งานฝีมือ") || lowerText.includes("handicraft") || lowerText.includes("DIY")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🛠️ ทำงานฝีมือหรือโปรเจค DIY เพื่อพัฒนาความคิดสร้างสรรค์และทักษะการทำงาน" 
      };
    }

    // ==================== หมวดหมู่: การลงทุน ====================
    else if (lowerText.includes("ศึกษาการลงทุน") || lowerText.includes("investment study") || lowerText.includes("หุ้น")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "📊 ศึกษาการลงทุนในหุ้น กองทุน หรือสินทรัพย์ต่างๆ เพื่อการวางแผนทางการเงิน" 
      };
    }
    else if (lowerText.includes("ปรึกษาการเงิน") || lowerText.includes("financial advisor") || lowerText.includes("วางแผนการเงิน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "💰 ปรึกษาผู้เชี่ยวชาญด้านการเงินเพื่อวางแผนการลงทุนและการออม" 
      };
    }
    else if (lowerText.includes("ออมเงิน") || lowerText.includes("saving") || lowerText.includes("เก็บเงิน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🐖 วางแผนการออมเงินเพื่อเป้าหมายทางการเงินในอนาคต" 
      };
    }

    // ==================== หมวดหมู่: สัตว์เลี้ยง ====================
    else if (lowerText.includes("พาสัตว์เลี้ยงตรวจสุขภาพ") || lowerText.includes("pet checkup") || lowerText.includes("หมอสัตว์")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🐕 พาสัตว์เลี้ยงไปตรวจสุขภาพกับสัตวแพทย์เพื่อดูแลสุขอนามัย" 
      };
    }
    else if (lowerText.includes("ฝึกสัตว์เลี้ยง") || lowerText.includes("pet training") || lowerText.includes("ฝึกสุนัข")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🎯 ฝึกสัตว์เลี้ยงเพื่อพัฒนาพฤติกรรมและสร้างความสัมพันธ์ที่ดี" 
      };
    }
    else if (lowerText.includes("ตัดขนสัตว์เลี้ยง") || lowerText.includes("pet grooming") || lowerText.includes("อาบน้ำสัตว์")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "✂️ พาสัตว์เลี้ยงไปตัดขนหรืออาบน้ำเพื่อสุขอนามัยและความสะอาด" 
      };
    }

    // ==================== หมวดหมู่: การขนส่ง ====================
    else if (lowerText.includes("ต่ออายุใบขับขี่") || lowerText.includes("renew license") || lowerText.includes("ใบขับขี่")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "high", 
        description: "🚦 ไปต่ออายุใบขับขี่รถยนต์หรือรถจักรยานยนต์ที่กรมการขนส่ง" 
      };
    }
    else if (lowerText.includes("ซื้อตั๋วเครื่องบิน") || lowerText.includes("flight ticket") || lowerText.includes("จองเที่ยวบิน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "✈️ จองตั๋วเครื่องบินสำหรับการเดินทางในประเทศหรือต่างประเทศ" 
      };
    }
    else if (lowerText.includes("จองที่พัก") || lowerText.includes("hotel booking") || lowerText.includes("โรงแรม")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🏨 จองที่พักเช่นโรงแรมหรือรีสอร์ทสำหรับการเดินทางหรือพักผ่อน" 
      };
    }

    // ==================== หมวดหมู่: งานสังคม ====================
    else if (lowerText.includes("ไปงานแต่ง") || lowerText.includes("wedding") || lowerText.includes("พิธีแต่งงาน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "💒 ไปร่วมงานแต่งงานของเพื่อนหรือญาติ เตรียมของขวัญและคำอวยพร" 
      };
    }
    else if (lowerText.includes("งานบวช") || lowerText.includes("ordination") || lowerText.includes("พิธีบวช")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🙏 ไปร่วมงานบวช เตรียมปัจจัยไทยธรรมและให้กำลังใจผู้บวช" 
      };
    }
    else if (lowerText.includes("งานขึ้นบ้านใหม่") || lowerText.includes("house warming") || lowerText.includes("เปิดบ้าน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🏡 ไปร่วมงานขึ้นบ้านใหม่ เตรียมของขวัญและคำอวยพรสำหรับเจ้าของบ้าน" 
      };
    }

    // ==================== หมวดหมู่: สุขภาพจิต ====================
    else if (lowerText.includes("นั่งสมาธิ") || lowerText.includes("meditation") || lowerText.includes("ฝึกสติ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🧘‍♂️ ฝึกนั่งสมาธิหรือฝึกสติเพื่อพัฒนาความสงบภายในและลดความเครียด" 
      };
    }
    else if (lowerText.includes("เขียนบันทึก") || lowerText.includes("journaling") || lowerText.includes("ไดอารี่")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "📔 เขียนบันทึกประจำวันเพื่อสำรวจความคิดและความรู้สึกภายใน" 
      };
    }
    else if (lowerText.includes("พักผ่อนสมอง") || lowerText.includes("digital detox") || lowerText.includes("ลดการใช้โซเชียล")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🧠 พักผ่อนสมองด้วยการลดการใช้โซเชียลมีเดียหรืออุปกรณ์ดิจิทัล" 
      };
    }

    // ==================== หมวดหมู่: กิจกรรมครอบครัว ====================
    else if (lowerText.includes("พาครอบครัวเที่ยว") || lowerText.includes("family trip") || lowerText.includes("ไปกับครอบครัว")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "👨‍👩‍👧‍👦 พาครอบครัวไปเที่ยวหรือทำกิจกรรมร่วมกันเพื่อสร้างความสัมพันธ์ที่ดี" 
      };
    }
    else if (lowerText.includes("เยี่ยมญาติ") || lowerText.includes("visit relatives") || lowerText.includes("ไปหาญาติ")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "👵 ไปเยี่ยมญาติผู้ใหญ่หรือสมาชิกครอบครัวเพื่อรักษาความสัมพันธ์" 
      };
    }
    else if (lowerText.includes("ช่วยงานบ้าน") || lowerText.includes("house chores") || lowerText.includes("ทำงานบ้าน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "low", 
        description: "🏠 ช่วยทำงานบ้านต่างๆ เพื่อแบ่งเบาภาระภายในครอบครัว" 
      };
    }

    // ==================== หมวดหมู่: การศึกษาเด็ก ====================
    else if (lowerText.includes("ช่วยลูกทำการบ้าน") || lowerText.includes("help with homework") || lowerText.includes("สอนการบ้าน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "📚 ช่วยลูกหรือน้องทำการบ้านและอธิบายเนื้อหาวิชาการต่างๆ" 
      };
    }
    else if (lowerText.includes("พาเด็กไปเรียนพิเศษ") || lowerText.includes("kids tutoring") || lowerText.includes("ส่งลูกเรียน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🎒 พาเด็กไปเรียนพิเศษหรือส่งลูกไปโรงเรียนตามตารางเรียน" 
      };
    }
    else if (lowerText.includes("กิจกรรมโรงเรียน") || lowerText.includes("school activity") || lowerText.includes("งานโรงเรียน")) {
      suggestion = { 
        category: "ส่วนตัว", 
        priority: "medium", 
        description: "🏫 ไปร่วมกิจกรรมโรงเรียนของลูกเช่น วันพ่อ แม่ หรืองานกีฬาสี" 
      };
    }

    res.json({ success: true, suggestion });
  } catch (err) {
    console.error('🔥 AI Suggestion error:', err);
    res.status(500).json({ success: false, message: "AI error", error: err.message });
  }
});

// ==================== AI PREDICTION ENDPOINT ====================
// AI Real-time Text Prediction Only
app.post("/ai/predict-task", async (req, res) => {
  try {
    const { text } = req.body;
    const lowerText = text.toLowerCase();
    
    // คลังคำศัพท์สำหรับทำนาย - ขยายความละเอียด
    const wordDatabase = {
      // ============ การศึกษา/เรียน ============
      // สอบ
      "ส": ["สอบ", "สอน", "ส่งงาน", "ส่งรายงาน"],
      "สอ": ["สอบ", "สอน", "สอบ final", "สอบ midterm", "สอบปลายภาค", "สอบเก็บคะแนน", "สอบกลางภาค"],
      "สอบ": ["สอบ final", "สอบ midterm", "สอบปลายภาค", "สอบเก็บคะแนน", "สอบกลางภาค", "สอบย่อย", "สอบสัปดาห์หน้า"],
      "exam": ["exam final", "exam midterm", "exam preparation", "exam week"],
      "เทส": ["test", "test final", "test midterm", "test quiz"],
      "test": ["test final", "test midterm", "test preparation", "test quiz", "test tomorrow"],
      "ควิ": ["quiz", "quiz test"],
      "quiz": ["quiz test", "quiz next week", "quiz preparation"],
      "ไฟนอล": ["final exam", "final test", "final project"],
      "final": ["final exam", "final test", "final project", "final presentation"],
      "มิด": ["midterm", "midterm exam"],
      "midterm": ["midterm exam", "midterm test", "midterm preparation"],
      
      // งาน/การบ้าน
      "ส่ง": ["ส่งงาน", "ส่งรายงาน", "ส่ง assignment", "ส่งโปรเจค", "ส่งการบ้าน"],
      "ส่งงาน": ["ส่งงาน assignment", "ส่งงานโปรเจค", "ส่งงานกลุ่ม", "ส่งงานรายบุคคล"],
      "งาน": ["งานมอบหมาย", "งานกลุ่ม", "งาน assignment", "งานโปรเจค"],
      "การบ้าน": ["การบ้านคณิตศาสตร์", "การบ้านภาษาอังกฤษ", "การบ้านวิทยาศาสตร์"],
      "hw": ["homework", "homework assignment"],
      "homework": ["homework math", "homework english", "homework science"],
      "ass": ["assignment", "assignment final", "assignment group", "assignment submission"],
      "assignment": ["assignment final", "assignment group", "assignment submission", "assignment individual"],
      "งานมอบหมาย": ["งานมอบหมายกลุ่ม", "งานมอบหมายรายบุคคล"],
      
      // โปรเจค
      "โป": ["โปรเจค", "โปรเจคจบ", "โปรเจคกลุ่ม"],
      "โปร": ["โปรเจค", "โปรเจคจบ", "โปรเจคกลุ่ม", "โปรเจค final"],
      "โปรเจค": ["โปรเจคจบ", "โปรเจคกลุ่ม", "โปรเจค final", "โปรเจครายวิชา", "โปรเจคปีสุดท้าย"],
      "project": ["project management", "project meeting", "project final", "project group", "project presentation"],
      "จบ": ["โปรเจคจบ", "งานจบ", "ปัญหาพิเศษ"],
      "ปัญหาพิเศษ": ["ปัญหาพิเศษโปรเจค", "ปัญหาพิเศษจบการศึกษา"],
      "senior project": ["senior project presentation", "senior project defense"],
      
      // การนำเสนอ
      "present": ["presentation", "present งาน", "present โปรเจค", "present กลุ่ม"],
      "presentation": ["presentation final", "presentation group", "presentation slides"],
      "นำ": ["นำเสนอ", "นำเสนองาน", "นำเสนอโปรเจค"],
      "นำเสนอ": ["นำเสนองาน", "นำเสนอโปรเจค", "นำเสนองานกลุ่ม", "นำเสนอผลงาน"],
      "พรี": ["พรีเซ้น", "พรีเซนต์"],
      "พรีเซ้น": ["พรีเซ้นงาน", "พรีเซ้นโปรเจค", "พรีเซ้นต์กลุ่ม"],
      "พรีเซนต์": ["พรีเซนต์งาน", "พรีเซนต์โปรเจค"],
      "slides": ["slides presentation", "prepare slides"],
      "สไลด์": ["สไลด์นำเสนอ", "ทำสไลด์"],
      "ป้องกัน": ["ป้องกันโปรเจค", "ป้องกันวิทยานิพนธ์", "ป้องกันปริญญานิพนธ์"],
      "defend": ["defend project", "defend thesis"],
      

      
      // เรียน
      "เรียน": ["เรียนพิเศษ", "เรียนออนไลน์", "เรียนกลุ่ม", "เรียน lecture", "เรียนชดเชย"],
      "class": ["class online", "class lecture", "class tutorial", "class makeup"],
      "คลาส": ["คลาสออนไลน์", "คลาส lecture"],
      "lecture": ["lecture online", "lecture recording", "lecture notes", "lecture hall"],
      "lec": ["lecture", "lecture online"],
      "คาบ": ["คาบเรียน", "คาบ lecture", "คาบ laboratory", "คาบ lab"],
      "lab": ["laboratory", "lab work", "lab report", "lab session"],
      "laboratory": ["laboratory work", "laboratory experiment"],
      "แลป": ["แลปเรียน", "แลป experiment"],
      "ปฏิบัติการ": ["ปฏิบัติการทดลอง", "ปฏิบัติการห้องแลป"],
      "tutorial": ["tutorial class", "tutorial session"],
      "กวดวิชา": ["กวดวิชาคณิตศาสตร์", "กวดวิชาฟิสิกส์"],
      
      // ติว
      "ติว": ["ติวสอบ", "ติวกลุ่ม", "ติวพิเศษ", "ติวหนังสือ"],
      "tutor": ["tutor session", "tutor group", "private tutor"],
      "ติวเตอร์": ["ติวเตอร์ส่วนตัว", "ติวเตอร์กลุ่ม"],
      "สอน": ["สอนเพื่อน", "สอนเพื่อนทำการบ้าน", "สอนติว"],
      "สอนเพื่อน": ["สอนเพื่อนติว", "สอนเพื่อนทำการบ้าน", "สอนเพื่อนเรียน"],
      "ทบทวน": ["ทบทวนบทเรียน", "ทบทวนก่อนสอบ"],
      "review": ["review lesson", "review before exam"],
      
      // รายงาน
      "รายงาน": ["รายงานงาน", "รายงานโปรเจค", "report", "รายงานการทดลอง"],
      "report": ["report submission", "report final", "report lab", "lab report"],
      "เขียนรายงาน": ["เขียนรายงานการทดลอง", "เขียนรายงานงานวิจัย"],
      "วิจัย": ["งานวิจัย", "วิจัยโปรเจค", "research"],
      "research": ["research project", "research paper", "research work"],
      "paper": ["research paper", "term paper", "write paper"],
      "เปเปอร์": ["เปเปอร์วิจัย", "เขียนเปเปอร์"],
      "วิทยานิพนธ์": ["วิทยานิพนธ์ปริญญาโท", "ทำวิทยานิพนธ์"],
      "thesis": ["thesis writing", "thesis defense", "thesis project"],
      
      // ลงทะเบียน
      "ลงทะเบียน": ["ลงทะเบียนเรียน", "ลงทะเบียนวิชา"],
      "register": ["register course", "course registration"],
      "reg": ["registration", "register course"],
      "เพิ่มวิชา": ["เพิ่มวิชาเรียน", "เพิ่มวิชาเลือก"],
      "ถอนวิชา": ["ถอนวิชาเรียน", "ถอนรายวิชา"],
      "drop": ["drop course", "drop class"],
      
      // อื่นๆ ด้านการศึกษา
      "เกรด": ["เช็คเกรด", "ออกเกรด", "ดูเกรด"],
      "grade": ["check grade", "grade announcement"],
      "คะแนน": ["เช็คคะแนน", "ดูคะแนน", "คะแนนสอบ"],
      "ขาด": ["ขาดเรียน", "ลาป่วย"],
      "absent": ["absent class", "absent excuse"],
      "มาสาย": ["มาสายเรียน", "มาสายคาบ"],
      "late": ["late to class", "arrive late"],
      "จบการศึกษา": ["จบการศึกษาปีนี้", "พิธีจบการศึกษา"],
      "graduation": ["graduation ceremony", "graduation day"],
      "ครอบครูดี้": ["พิธีครอบครูดี้", "วันครอบครูดี้"],

      // ============ งาน/การทำงาน ============
      // ประชุม
      "ป": ["ประชุม", "ประชุมทีม", "ประชุมด่วน", "ปั่นจักรยาน", "ปาร์ตี้"],
      "ประ": ["ประชุม", "ประชุมทีม", "ประชุมด่วน"],
      "ประชุม": ["ประชุมทีม", "ประชุมด่วน", "ประชุมลูกค้า", "meeting", "ประชุมออนไลน์", "ประชุมใหญ่"],
      "meeting": ["meeting ทีม", "meeting ลูกค้า", "meeting ด่วน", "meeting online", "meeting room"],
      "meet": ["meeting", "meet client", "meet team"],
      "มีท": ["มีทติ้ง", "มีทลูกค้า"],
      "มีทติ้ง": ["มีทติ้งทีม", "มีทติ้งออนไลน์"],
      "ประชุมออนไลน์": ["ประชุมออนไลน์ zoom", "ประชุมออนไลน์ teams"],
      "zoom": ["zoom meeting", "zoom call"],
      "teams": ["teams meeting", "microsoft teams"],
      "conference": ["conference call", "conference meeting", "video conference"],
      "call": ["conference call", "client call", "team call"],
      "สัมม": ["สัมมนาวิชาการ", "สัมมนาฝึกอบรม"],
      "สัมมนา": ["สัมมนาวิชาการ", "สัมมนาฝึกอบรม"],
      "seminar": ["seminar workshop", "attend seminar"],
      
      // ลูกค้า
      "ลูก": ["ลูกค้า", "ลูกค้า meeting", "ลูกค้า presentation"],
      "ลูกค้า": ["ลูกค้า meeting", "ลูกค้า presentation", "พบลูกค้า", "นัดลูกค้า"],
      "client": ["client meeting", "client presentation", "client call", "meet client"],
      "พบลูกค้า": ["พบลูกค้านัดหมาย", "พบลูกค้าที่บริษัท"],
      "นัดลูกค้า": ["นัดลูกค้าประชุม", "นัดลูกค้านำเสนอ"],
      "customer": ["customer meeting", "customer service"],
      
      // อีเมล
      "ส่งเมล": ["ส่ง email", "ส่งอีเมล", "ส่งเมลงาน", "ส่งเมลลูกค้า"],
      "em": ["email", "email ลูกค้า", "email ทีม", "email ส่งงาน"],
      "email": ["email ลูกค้า", "email ทีม", "email ส่งงาน", "check email", "reply email"],
      "อีเมล": ["อีเมลงาน", "อีเมลลูกค้า", "เช็คอีเมล", "ตอบอีเมล"],
      "เช็คเมล": ["เช็คเมลงาน", "เช็คเมลลูกค้า"],
      "ตอบเมล": ["ตอบเมลลูกค้า", "ตอบเมลด่วน"],
      "reply": ["reply email", "reply message"],
      
      // งาน/โปรเจค
      "ติดต่อ": ["ติดต่อลูกค้า", "ติดต่อทีม", "ติดต่อ supplier", "ติดต่อพาร์ทเนอร์"],
      "contact": ["contact client", "contact supplier", "contact partner"],
      "supplier": ["supplier meeting", "contact supplier"],
      "vendor": ["vendor meeting", "vendor discussion"],
      
      // งานเอกสาร
      "เอก": ["เอกสาร", "เอกสารงาน", "เอกสารสัญญา"],
      "เอกสาร": ["เอกสารงาน", "เอกสารสัญญา", "เอกสารลูกค้า", "เตรียมเอกสาร"],
      "document": ["document preparation", "document review", "document submission"],
      "เตรียมเอกสาร": ["เตรียมเอกสารประชุม", "เตรียมเอกสารนำเสนอ"],
      "ตรวจเอกสาร": ["ตรวจเอกสารงาน", "ตรวจเอกสารสัญญา"],
      "ส่งเอกสาร": ["ส่งเอกสารลูกค้า", "ส่งเอกสารงาน"],
      "สัญญา": ["สัญญางาน", "ทำสัญญา", "ตรวจสัญญา"],
      "contract": ["contract review", "sign contract", "contract negotiation"],
      "ลงนาม": ["ลงนามสัญญา", "ลงนามเอกสาร"],
      "sign": ["sign contract", "sign document"],
      
      // วางแผน
      "วาง": ["วางแผน", "วางแผนงาน", "วางแผนโปรเจค"],
      "วางแผน": ["วางแผนงาน", "วางแผนโปรเจค", "planning", "วางแผนการตลาด"],
      "plan": ["plan งาน", "plan โปรเจค", "planning meeting", "plan strategy"],
      "planning": ["planning meeting", "strategic planning"],
      "กลยุทธ์": ["วางกลยุทธ์", "ประชุมกลยุทธ์"],
      "strategy": ["strategy meeting", "strategy planning"],
      "จัดการ": ["จัดการโปรเจค", "จัดการงาน", "จัดการเวลา"],
      "จัดการเวลา": ["จัดการเวลางาน", "จัดการเวลาเรียน"],
      "time management": ["time management workshop", "time management training"],
      "management": ["project management", "time management"],
      
      // ฝึกอบรม
      "ฝึก": ["ฝึกอบรม", "ฝึกงาน"],
      "ฝึกอบรม": ["ฝึกอบรมงาน", "training", "ฝึกอบรมพนักงาน"],
      "training": ["training session", "training workshop", "training course", "training program"],
      "อบรม": ["อบรมพนักงาน", "อบรมภายใน", "อบรมภายนอก"],
      "workshop": ["workshop งาน", "workshop เรียน", "workshop training"],
      "สัมมน": ["สัมมนาวิชาการ", "สัมมนาฝึกอบรม", "สัมมนาบริษัท"],
      "onboarding": ["onboarding session", "employee onboarding"],
      
      // การนำเสนอขาย
      "นำเสนอขาย": ["นำเสนอขายลูกค้า", "นำเสนอขายสินค้า"],
      "pitch": ["pitch presentation", "pitch to client", "sales pitch"],
      "sales": ["sales meeting", "sales presentation", "sales call"],
      "ขาย": ["นำเสนอขาย", "ปิดการขาย"],
      "proposal": ["proposal submission", "write proposal", "proposal presentation"],
      "quotation": ["send quotation", "prepare quotation"],
      "ใบเสนอราคา": ["ทำใบเสนอราคา", "ส่งใบเสนอราคา"],
      
      // งานบัญชีการเงิน
      "บัญชี": ["ทำบัญชี", "ตรวจบัญชี", "accounting"],
      "accounting": ["accounting work", "accounting review"],
      "การเงิน": ["งานการเงิน", "ประชุมการเงิน", "finance"],
      "finance": ["finance meeting", "finance report"],
      "งบ": ["งบประมาณ", "ทำงบ", "budget"],
      "budget": ["budget planning", "budget review", "budget meeting"],
      "งบประมาณ": ["วางงบประมาณ", "ทำงบประมาณ"],
      "invoice": ["send invoice", "prepare invoice"],
      "ใบแจ้งหนี้": ["ออกใบแจ้งหนี้", "ส่งใบแจ้งหนี้"],
      "ใบเสร็จ": ["ออกใบเสร็จ", "ส่งใบเสร็จ"],
      "receipt": ["issue receipt", "send receipt"],
      "จ่ายเงิน": ["จ่ายเงินซัพพลายเออร์", "จ่ายเงินค่าบริการ"],
      "payment": ["payment processing", "make payment"],
      
      // งาน HR
      "สัมภาษณ์": ["สัมภาษณ์งาน", "สัมภาษณ์พนักงาน", "interview"],
      "interview": ["job interview", "interview candidate"],
      "สมัครงาน": ["ส่งใบสมัครงาน", "สมัครงานออนไลน์"],
      "apply": ["apply job", "job application"],
      "รับสมัคร": ["รับสมัครงาน", "รับสมัครพนักงาน"],
      "recruit": ["recruit staff", "recruitment"],
      "ประเมิน": ["ประเมินผลงาน", "ประเมินพนักงาน"],
      "evaluation": ["performance evaluation", "staff evaluation"],
      "ทำงาน": ["ทำงานที่บริษัท", "ทำงานที่บ้าน", "work"],
      "work": ["work from home", "work at office", "work on project"],
      "wfh": ["work from home", "working from home"],
      "ทำงานที่บ้าน": ["work from home", "remote work"],
      "remote": ["remote work", "remote meeting"],
      
      // เดดไลน์
      "dead": ["deadline", "deadline งาน"],
      "deadline": ["deadline งาน", "deadline project", "deadline submission"],
      "เดดไลน์": ["เดดไลน์งาน", "เดดไลน์โปรเจค"],
      "due": ["due date", "due tomorrow"],
      "ครบกำหนด": ["ครบกำหนดส่ง", "ครบกำหนดชำระ"],
      "กำหนดส่ง": ["กำหนดส่งงาน", "วันกำหนดส่ง"],
      
      // การลาพักร้อน
      "ลา": ["ลาป่วย", "ลาพักร้อน", "ลางาน"],
      "ลาป่วย": ["ลาป่วยวันนี้", "sick leave"],
      "ลาพักร้อน": ["ลาพักร้อนสัปดาห์หน้า", "annual leave"],
      "leave": ["sick leave", "annual leave", "leave request"],
      "วันหยุด": ["วันหยุดยาว", "วันหยุดพักร้อน"],
      "holiday": ["public holiday", "holiday vacation"],
      "vacation": ["vacation trip", "vacation leave"],

      // ============ ออกกำลังกาย/กีฬา ============
      // วิ่ง
      "วิ": ["วิ่ง", "วิ่งออกกำลังกาย", "วิ่งตอนเช้า", "วิ่งมาราธอน", "วิเคราะห์"],
      "วิ่ง": ["วิ่งออกกำลังกาย", "วิ่งตอนเช้า", "วิ่งมาราธอน", "running", "วิ่งเหยาะๆ"],
      "running": ["running exercise", "running morning", "morning run", "evening run"],
      "run": ["morning run", "evening run", "run 5k"],
      "จ๊อก": ["จ๊อกกิ้ง", "จ๊อกกิ้งเช้า"],
      "จ๊อกกิ้ง": ["จ๊อกกิ้งตอนเช้า", "จ๊อกกิ้งสวนสาธารณะ", "jogging"],
      "jogging": ["morning jogging", "jogging in park"],
      "มาราธอน": ["แข่งมาราธอน", "ฝึกมาราธอน", "marathon"],
      "marathon": ["marathon training", "marathon race", "half marathon"],
      "ฮาล์ฟ": ["half marathon", "ฮาล์ฟมาราธอน"],
      
      // ยิม/ฟิตเนส
      "ออก": ["ออกกำลังกาย", "ออกกำลังกายตอนเย็น", "ออกกำลังกายที่ยิม"],
      "ออกกำ": ["ออกกำลังกาย", "ออกกำลังกายตอนเย็น", "ออกกำลังกายที่ยิม"],
      "ออกกำลังกาย": ["ออกกำลังกายที่ยิม", "ออกกำลังกายที่บ้าน", "exercise"],
      "exercise": ["exercise at gym", "exercise at home", "morning exercise"],
      "ยิม": ["ไปยิม", "เล่นยิม", "gym"],
      "gym": ["go to gym", "gym workout", "gym training"],
      "ฟิต": ["ฟิตเนส", "ฟิตร่างกาย", "ฟิตหุ่น", "fitness"],
      "ฟิตเนส": ["ฟิตเนสเซ็นเตอร์", "คลาสฟิตเนส"],
      "fitness": ["fitness center", "fitness class", "fitness training"],
      "workout": ["workout at gym", "workout routine", "workout session"],
      "เวิร์คเอาท์": ["เวิร์คเอาท์ที่ยิม", "เวิร์คเอาท์ที่บ้าน"],
      
      // เวทเทรนนิ่ง
      "เวท": ["เวทเทรนนิ่ง", "ยกเวท", "weight training"],
      "weight": ["weight lifting", "weight training", "lift weights"],
      "ยก": ["ยกเวท", "ยกน้ำหนัก"],
      "ยกน้ำหนัก": ["ยกน้ำหนักที่ยิม", "ยกน้ำหนักฟิตหุ่น"],
      "ยกเวท": ["ยกเวทที่ยิม", "เทรนยกเวท"],
      "bench press": ["bench press exercise"],
      "เบนช์เพรส": ["เบนช์เพรสที่ยิม"],
      "squat": ["squat exercise", "leg squat"],
      "สควอต": ["สควอตขา"],
      "deadlift": ["deadlift exercise"],
      "เดดลิฟต์": ["เดดลิฟต์เทรนนิ่ง"],
      
      // ว่ายน้ำ
      "ว่าย": ["ว่ายน้ำ", "ว่ายน้ำสระ"],
      "ว่ายน้ำ": ["ว่ายน้ำสระ", "ว่ายน้ำทะเล", "swimming", "ว่ายน้ำออกกำลังกาย"],
      "swim": ["swimming pool", "swimming exercise", "swim in sea"],
      "swimming": ["swimming class", "swimming training", "swimming pool"],
      "สระว่ายน้ำ": ["ไปสระว่ายน้ำ", "สระว่ายน้ำสาธารณะ"],
      "pool": ["swimming pool", "go to pool"],
      
      // โยคะ/พิลาทิส
      "โย": ["โยคะ", "โยคะเช้า"],
      "โยคะ": ["โยคะตอนเช้า", "โยคะผ่อนคลาย", "yoga", "คลาสโยคะ"],
      "yoga": ["yoga class", "yoga morning", "yoga session", "hot yoga"],
      "พิ": ["พิลาทิส", "พิลาทิสคลาส"],
      "พิลาทิส": ["คลาสพิลาทิส", "พิลาทิสเช้า", "pilates"],
      "pilates": ["pilates class", "pilates training"],
      "meditation": ["meditation session", "morning meditation"],
      "สมาธิ": ["ฝึกสมาธิ", "นั่งสมาธิ"],
      "ฌาน": ["ฝึกฌาน", "meditation"],
      
      // จักรยาน
      "ปั่น": ["ปั่นจักรยาน", "ปั่นเสือภูเขา"],
      "ปั่นจักรยาน": ["ปั่นจักรยานเสือภูเขา", "ปั่นจักรยานออกกำลังกาย", "cycling"],
      "cycling": ["cycling exercise", "cycling mountain", "road cycling"],
      "bike": ["bike riding", "bike exercise", "mountain bike"],
      "จักรยาน": ["ขี่จักรยาน", "ปั่นจักรยาน"],
      "ขี่จักรยาน": ["ขี่จักรยานเสือภูเขา", "ขี่จักรยานไปทำงาน"],
      "เสือภูเขา": ["ปั่นเสือภูเขา", "จักรยานเสือภูเขา"],
      "mountain bike": ["mountain bike riding", "mountain bike trail"],
      "road bike": ["road bike cycling"],
      "spinning": ["spinning class", "indoor cycling"],
      "สปินนิ่ง": ["คลาสสปินนิ่ง"],
      
      // เต้น
      "เต้น": ["เต้นแอโรบิค", "เต้นซุมบ้า", "dance", "เต้นออกกำลังกาย"],
      "dance": ["dance aerobic", "dance exercise", "dance class"],
      "แอโร": ["แอโรบิค", "แอโรบิคเต้น"],
      "aerobic": ["aerobic exercise", "aerobic class", "water aerobic"],
      "แอโรบิค": ["คลาสแอโรบิค", "เต้นแอโรบิค"],
      "ซุมบ้า": ["คลาสซุมบ้า", "เต้นซุมบ้า", "zumba"],
      "zumba": ["zumba class", "zumba dance"],
      "hiphop": ["hiphop dance", "hiphop class"],
      "ฮิปฮอป": ["เต้นฮิปฮอป", "คลาสฮิปฮอป"],
      
      // มวย
      "มวย": ["มวยไทย", "ต่อยมวย", "boxing", "เล่นมวย"],
      "boxing": ["boxing training", "boxing class", "boxing workout"],
      "ต่อย": ["ต่อยมวย", "ต่อยเส้น"],
      "มวยไทย": ["เล่นมวยไทย", "ฝึกมวยไทย", "muay thai"],
      "muay thai": ["muay thai training", "muay thai class"],
      "kickboxing": ["kickboxing class", "kickboxing training"],
      "คิกบ็อกซิ่ง": ["คลาสคิกบ็อกซิ่ง"],
      "mma": ["mma training", "mixed martial arts"],
      "กระสอบ": ["ต่อยกระสอบ", "เตะกระสอบ"],
      "punching bag": ["punching bag workout"],
      
      // กีฬาบอล
      "ฟุต": ["ฟุตบอล", "ฟุตซอล"],
      "ฟุตบอล": ["เล่นฟุตบอล", "ฟุตบอลกับเพื่อน", "soccer", "แข่งฟุตบอล"],
      "soccer": ["soccer game", "soccer practice", "play soccer"],
      "football": ["football game", "football practice"],
      "บอล": ["เล่นบอล", "บอลฟุตซอล", "ฟุตบอล"],
      "ฟุตซอล": ["เล่นฟุตซอล", "แข่งฟุตซอล", "futsal"],
      "futsal": ["futsal game", "futsal match"],
      
      "บาส": ["บาสเกตบอล", "เล่นบาส", "basketball"],
      "บาสเกตบอล": ["เล่นบาสเกตบอล", "แข่งบาส", "basketball"],
      "basketball": ["basketball game", "basketball practice", "play basketball"],
      "สนามบาส": ["ไปสนามบาส", "เล่นบาสที่สนาม"],
      
      "วอล": ["วอลเลย์บอล"],
      "วอลเลย์": ["วอลเลย์บอล", "เล่นวอลเลย์"],
      "วอลเลย์บอล": ["เล่นวอลเลย์บอล", "แข่งวอลเลย์บอล", "volleyball"],
      "volleyball": ["volleyball game", "volleyball practice"],
      
      // แบดมินตัน/เทนนิส
      "แบ": ["แบดมินตัน", "แบด"],
      "แบด": ["แบดมินตัน", "ตีแบด", "badminton"],
      "แบดมินตัน": ["เล่นแบดมินตัน", "ตีแบด", "badminton", "แข่งแบด"],
      "badminton": ["badminton court", "badminton game", "play badminton"],
      "ตีแบด": ["ไปตีแบด", "ตีแบดกับเพื่อน"],
      "คอร์ทแบด": ["จองคอร์ทแบด", "แบดมินตันคอร์ท"],
      
      "เท": ["เทนนิส", "เทนนิสคอร์ท"],
      "เทนนิส": ["เล่นเทนนิส", "ตีเทนนิส", "tennis", "แข่งเทนนิส"],
      "tennis": ["tennis court", "tennis game", "play tennis"],
      "ตีเทนนิส": ["ไปตีเทนนิส", "ตีเทนนิสกับเพื่อน"],
      "คอร์ทเทนนิส": ["จองคอร์ทเทนนิส"],
      
      "ปิ": ["ปิงปอง"],
      "ปิงปอง": ["เล่นปิงปอง", "ตีปิงปอง", "ping pong", "table tennis"],
      "ping pong": ["ping pong table", "ping pong game"],
      "table tennis": ["table tennis match"],
      "เทเบิลเทนนิส": ["เล่นเทเบิลเทนนิส"],
      
      // กอล์ฟ
      "กอล์ฟ": ["เล่นกอล์ฟ", "ตีกอล์ฟ", "golf"],
      "golf": ["golf game", "golf practice", "play golf"],
      "ตีกอล์ฟ": ["ไปตีกอล์ฟ", "ตีกอล์ฟที่สนาม"],
      "driving range": ["golf driving range"],
      "ไดร์ฟวิ่งเรนจ์": ["ฝึกที่ไดร์ฟวิ่งเรนจ์"],
      
      // กีฬาอื่นๆ
      "เดิน": ["เดินเล่น", "เดินออกกำลัง", "walk", "เดินป่า"],
      "walk": ["walk in park", "walk exercise", "morning walk"],
      "เดินเล่น": ["เดินเล่นสวน", "เดินเล่นชายหาด", "เดินเล่นห้าง"],
      "เดินป่า": ["เดินป่าภูเขา", "hiking"],
      "hiking": ["mountain hiking", "hiking trail"],
      "ปีนเขา": ["ปีนเขาออกกำลัง", "rock climbing"],
      "rock climbing": ["indoor rock climbing", "outdoor climbing"],
      "ปีนหน้าผา": ["ปีนหน้าผากีฬา"],
      
      "สเก็ต": ["สเก็ตบอร์ด", "โรลเลอร์เสก็ต"],
      "skateboard": ["skateboard practice"],
      "โรลเลอร์": ["โรลเลอร์เสก็ต", "โรลเลอร์บล็ด"],
      "roller": ["roller skating", "roller blade"],
      
      "กรีฑา": ["วิ่งกรีฑา", "ฝึกกรีฑา", "athletics"],
      "athletics": ["athletics training", "track and field"],
      "ว่ายน้ำ sprint": ["ว่ายน้ำแข่ง"],

      // ============ ส่วนตัว/สังคม ============
      // ช้อปปิ้ง
      "ซื้อ": ["ซื้อของ", "ซื้อของที่ห้าง", "ซื้ออาหาร", "shopping", "ซื้อของออนไลน์"],
      "ซื้อของ": ["ซื้อของห้าง", "ซื้อของออนไลน์", "shopping", "ซื้อของใช้"],
      "shopping": ["shopping mall", "online shopping", "grocery shopping"],
      "ช้อป": ["ช้อปปิ้ง", "ช้อปออนไลน์", "ช้อปที่ห้าง"],
      "ช้อปปิ้ง": ["ช้อปปิ้งห้าง", "ช้อปปิ้งออนไลน์"],
      "ห้าง": ["ห้างสรรพสินค้า", "ห้างใกล้บ้าน", "ไปห้าง"],
      "ห้างสรรพสินค้า": ["ไปห้างสรรพสินค้า"],
      "mall": ["shopping mall", "go to mall"],
      "ตลาด": ["ไปตลาด", "ซื้อของตลาด"],
      "market": ["market shopping", "fresh market"],
      "ซุปเปอร์มาร์เก็ต": ["ซื้อของซุปเปอร์มาร์เก็ต"],
      "supermarket": ["supermarket shopping"],
      "คอนวีเนียนสโตร์": ["ไปเซเว่น", "ซื้อของเซเว่น"],
      "เซเว่น": ["ไปเซเว่น", "7-eleven"],
      
      // อาหาร
      "กิน": ["กินข้าว", "กินอาหาร", "กินข้าวเย็น"],
      "กินข้าว": ["กินข้าวเย็น", "กินข้าวเที่ยง", "dinner", "กินข้าวนอก"],
      "อาหาร": ["อาหารเช้า", "อาหารเที่ยง", "อาหารเย็น", "ทำอาหาร"],
      "breakfast": ["breakfast meeting", "eat breakfast"],
      "อาหารเช้า": ["ทานอาหารเช้า", "กินข้าวเช้า"],
      "lunch": ["lunch meeting", "lunch with friends"],
      "อาหารเที่ยง": ["ทานอาหารเที่ยง", "กินข้าวเที่ยง"],
      "dinner": ["dinner outside", "dinner with friends", "dinner date"],
      "อาหารเย็น": ["ทานอาหารเย็น", "กินข้าวเย็น"],
      "ทำอาหาร": ["ทำอาหารเย็น", "ทำอาหารกลางวัน", "cooking"],
      "cooking": ["cooking dinner", "cooking class"],
      "ทำขนม": ["ทำขนมอบ", "baking"],
      "baking": ["baking cake", "baking cookies"],
      "อบ": ["อบขนม", "อบเค้ก"],
      "ร้านอาหาร": ["ไปร้านอาหาร", "restaurant"],
      "restaurant": ["restaurant reservation", "new restaurant"],
      "จองร้าน": ["จองร้านอาหาร", "จองโต๊ะ"],
      "buffet": ["buffet dinner", "all you can eat"],
      "บุฟเฟ่ต์": ["กินบุฟเฟ่ต์", "บุฟเฟ่ต์อาหารญี่ปุ่น"],
      "cafe": ["café meeting", "work at café"],
      "คาเฟ่": ["ไปคาเฟ่", "นั่งคาเฟ่"],
      "กาแฟ": ["ดื่มกาแฟ", "coffee"],
      "coffee": ["coffee meeting", "coffee shop"],
      
      // เพื่อน/สังคม
      "นัด": ["นัดเพื่อน", "นัดประชุม", "นัดลูกค้า", "นัดหมอ"],
      "นัดเพื่อน": ["นัดเพื่อนกินข้าว", "นัดเพื่อนเที่ยว"],
      "friend": ["friend meeting", "friend dinner", "meet friends"],
      "เพื่อน": ["เพื่อนกินข้าว", "เพื่อนเที่ยว", "พบเพื่อน"],
      "พบเพื่อน": ["พบเพื่อนที่ห้าง", "พบเพื่อนกินข้าว"],
      "เจอเพื่อน": ["เจอเพื่อนที่คาเฟ่", "เจอเพื่อนเก่า"],
      "party": ["birthday party", "dinner party", "house party"],
      "ปาร์ตี้": ["งานปาร์ตี้", "ปาร์ตี้วันเกิด"],
      "งานเลี้ยง": ["งานเลี้ยงบริษัท", "งานเลี้ยงส่งท้ายปี"],
      "gathering": ["family gathering", "friends gathering"],
      "date": ["dinner date", "movie date"],
      "เดท": ["เดทกินข้าว", "เดทดูหนัง"],
      "ครอบครัว": ["รับประทานอาหารครอบครัว", "พบครอบครัว"],
      "family": ["family dinner", "family gathering", "family time"],
      
      // บันเทิง
      "หนัง": ["ดูหนัง", "หนังใหม่", "movie", "โรงหนัง"],
      "movie": ["movie theater", "new movie", "watch movie"],
      "ดูหนัง": ["ดูหนังโรง", "ดูหนังที่บ้าน"],
      "โรงหนัง": ["ไปโรงหนัง", "cinema"],
      "cinema": ["cinema ticket", "go to cinema"],
      "ซีรีย์": ["ดูซีรีย์", "ซีรีย์ใหม่", "series"],
      "series": ["watch series", "new series", "tv series"],
      "netflix": ["watch netflix", "netflix and chill"],
      "เน็ตฟลิกซ์": ["ดู netflix"],
      "คอนเสิร์ต": ["ไปคอนเสิร์ต", "concert"],
      "concert": ["music concert", "concert ticket"],
      "แสดง": ["ดูการแสดง", "การแสดง"],
      "show": ["watch show", "live show"],
      "ละคร": ["ดูละคร", "ละครทีวี"],
      
      // อ่านหนังสือ
      "อ่าน": ["อ่านหนังสือ", "อ่านนิยาย", "reading"],
      "อ่านหนังสือ": ["อ่านหนังสือเรียน", "อ่านนิยาย", "reading"],
      "reading": ["reading book", "reading time"],
      "หนังสือ": ["ซื้อหนังสือ", "อ่านหนังสือ"],
      "นิยาย": ["นิยายรัก", "นิยายแฟนตาซี", "อ่านนิยาย"],
      "novel": ["read novel", "new novel"],
      "มังงะ": ["อ่านมังงะ", "manga"],
      "manga": ["read manga", "new manga"],
      "comic": ["read comic", "comic book"],
      "การ์ตูน": ["อ่านการ์ตูน"],
      "ร้านหนังสือ": ["ไปร้านหนังสือ", "bookstore"],
      "bookstore": ["go to bookstore", "bookstore visit"],
      "ห้องสมุด": ["ไปห้องสมุด", "library"],
      "library": ["go to library", "study at library"],
      
      // เกม
      "เล่น": ["เล่นเกม", "เล่นกีฬา", "เล่นกับเพื่อน"],
      "เล่นเกม": ["เล่นเกมคอม", "เล่นเกมมือถือ", "game"],
      "game": ["computer game", "mobile game", "video game"],
      "เกม": ["เกมคอม", "เกมมือถือ", "เกมคอนโซล"],
      "gaming": ["gaming session", "gaming with friends"],
      "วีดีโอเกม": ["เล่นวีดีโอเกม", "เกม console"],
      "console": ["console gaming", "play console"],
      "คอนโซล": ["เล่นเกมคอนโซล"],
      "pc": ["pc gaming", "play on pc"],
      "คอมพิวเตอร์": ["เล่นเกมคอม"],
      "มือถือ": ["เล่นเกมมือถือ", "mobile game"],
      "mobile game": ["play mobile game"],
      "แข่งเกม": ["แข่งเกมออนไลน์", "gaming tournament"],
      "tournament": ["gaming tournament", "esports tournament"],
      "stream": ["streaming game", "live stream"],
      "สตรีม": ["สตรีมเกม", "ถ่ายทอดสด"],
      
      // นอนพักผ่อน
      "นอน": ["นอนหลับ", "นอนพักผ่อน", "sleep", "เข้านอน"],
      "sleep": ["sleep early", "sleep rest", "good sleep"],
      "หลับ": ["เข้านอนหลับ", "หลับพักผ่อน"],
      "พัก": ["พักผ่อน", "พักงาน", "rest"],
      "พักผ่อน": ["พักผ่อนหย่อนใจ", "พักผ่อนที่บ้าน", "relax"],
      "rest": ["rest time", "rest day"],
      "relax": ["relax time", "relaxing"],
      "ผ่อนคลาย": ["ผ่อนคลายกาย", "ผ่อนคลายใจ"],
      "งีบ": ["งีบหลับ", "nap"],
      "nap": ["afternoon nap", "power nap"],
      "นอนกลางวัน": ["งีบนอนกลางวัน"],
      
      // ดนตรี
      "ฟัง": ["ฟังเพลง", "ฟังดนตรี", "listen"],
      "ฟังเพลง": ["ฟังเพลงโปรด", "ฟังเพลงผ่อนคลาย", "music"],
      "music": ["music listening", "relaxing music", "music practice"],
      "เพลง": ["เพลงใหม่", "เพลงโปรด"],
      "ดนตรี": ["ฟังดนตรี", "ฝึกดนตรี"],
      "เล่นดนตรี": ["ฝึกเล่นดนตรี", "play music"],
      "instrument": ["practice instrument", "music instrument"],
      "เครื่องดนตรี": ["ฝึกเครื่องดนตรี"],
      "กีตาร์": ["ฝึกกีตาร์", "guitar"],
      "guitar": ["guitar practice", "play guitar"],
      "เปียโน": ["ฝึกเปียโน", "piano"],
      "piano": ["piano practice", "piano lesson"],
      "ร้องเพลง": ["ฝึกร้องเพลง", "singing"],
      "singing": ["singing practice", "karaoke"],
      "คาราโอเกะ": ["ไปคาราโอเกะ", "karaoke"],
      "karaoke": ["karaoke night", "karaoke with friends"],
      
      // เที่ยว/ท่องเที่ยว
      "เที่ยว": ["เที่ยวทะเล", "เที่ยวภูเขา", "travel", "เที่ยวต่างจังหวัด"],
      "travel": ["travel planning", "travel vacation", "travel abroad"],
      "ท่อง": ["ท่องเที่ยว", "ท่องเที่ยวต่างจังหวัด"],
      "ท่องเที่ยว": ["ท่องเที่ยวต่างจังหวัด", "ท่องเที่ยวธรรมชาติ", "ท่องเที่ยวต่างประเทศ"],
      "เดินทาง": ["เดินทางต่างจังหวัด", "เดินทางทำงาน", "trip"],
      "trip": ["business trip", "vacation trip", "road trip"],
      "ทริป": ["ทริปเที่ยว", "ทริปทำงาน", "ทริปต่างประเทศ"],
      "vac": ["vacation trip", "vacation planning"],
      "พักร้อน": ["เที่ยวพักร้อน", "วันหยุดพักร้อน"],
      "ทะเล": ["ไปทะเล", "เที่ยวทะเล"],
      "beach": ["go to beach", "beach vacation"],
      "ชายหาด": ["ไปชายหาด", "เดินชายหาด"],
      "เกาะ": ["ไปเกาะ", "เที่ยวเกาะ"],
      "island": ["island trip", "island hopping"],
      "ภูเขา": ["ไปภูเขา", "เที่ยวภูเขา"],
      "mountain": ["mountain trip", "mountain hiking"],
      "ต่างจังหวัด": ["เที่ยวต่างจังหวัด", "ไปต่างจังหวัด"],
      "ต่างประเทศ": ["เที่ยวต่างประเทศ", "ไปต่างประเทศ"],
      "abroad": ["travel abroad", "trip abroad"],
      "จอง": ["จองตั๋ว", "จองที่พัก", "booking"],
      "booking": ["hotel booking", "flight booking"],
      "จองตั๋ว": ["จองตั๋วเครื่องบิน", "จองตั๋วรถทัวร์"],
      "ticket": ["buy ticket", "book ticket"],
      "จองที่พัก": ["จองโรงแรม", "จองรีสอร์ท"],
      "โรงแรม": ["จองโรงแรม", "hotel"],
      "hotel": ["hotel booking", "hotel reservation"],
      "รีสอร์ท": ["จองรีสอร์ท", "resort"],
      "resort": ["resort booking", "beach resort"],
      
      // บ้าน/ที่พัก
      "บ้าน": ["ทำความสะอาดบ้าน", "จัดบ้าน", "clean", "กลับบ้าน"],
      "home": ["stay home", "work from home", "go home"],
      "clean": ["clean house", "clean room", "cleaning"],
      "ทำความสะอาด": ["ทำความสะอาดบ้าน", "ทำความสะอาดห้อง"],
      "กวาด": ["กวาดบ้าน", "กวาดพื้น"],
      "ถู": ["ถูบ้าน", "ถูพื้น"],
      "ซัก": ["ซักผ้า", "ซักเสื้อผ้า"],
      "ซักผ้า": ["ซักผ้าที่บ้าน", "laundry"],
      "laundry": ["do laundry", "laundry day"],
      "รีด": ["รีดผ้า", "รีดเสื้อผ้า"],
      "รีดผ้า": ["รีดผ้าเสื้อผ้า", "ironing"],
      "ironing": ["ironing clothes"],
      "จัด": ["จัดบ้าน", "จัดห้อง", "organize"],
      "จัดบ้าน": ["จัดห้อง", "จัดของ"],
      "organize": ["organize room", "organize stuff"],
      "ตกแต่ง": ["ตกแต่งบ้าน", "ตกแต่งห้อง"],
      "decorate": ["decorate room", "home decoration"],
      "ซ่อม": ["ซ่อมบ้าน", "ซ่อมของ"],
      "repair": ["home repair", "fix things"],
      "fix": ["fix something", "repair"],
      "จ้าง": ["จ้างคนทำความสะอาด", "จ้างช่าง"],
      
      // งานเฉลิมฉลอง
      "วันเกิด": ["วันเกิดเพื่อน", "วันเกิดครอบครัว", "birthday", "วันเกิดตัวเอง"],
      "birthday": ["birthday party", "birthday celebration", "birthday dinner"],
      "เกิด": ["วันเกิด", "ปาร์ตี้วันเกิด"],
      "ครบรอบ": ["ครบรอบงาน", "ครบรอบบริษัท", "anniversary"],
      "anniversary": ["work anniversary", "wedding anniversary"],
      "งานแต่ง": ["งานแต่งงาน", "wedding"],
      "wedding": ["wedding ceremony", "wedding party"],
      "แต่งงาน": ["พิธีแต่งงาน", "งานแต่งงาน"],
      "celebration": ["celebration party"],
      "ฉลอง": ["ฉลองความสำเร็จ", "งานฉลอง"],
      
      // สัตว์เลี้ยง
      "สัตว์เลี้ยง": ["พาสัตว์เลี้ยงเดินเล่น", "pet"],
      "pet": ["pet grooming", "pet vet"],
      "สุนัข": ["พาสุนัขเดินเล่น", "dog"],
      "dog": ["walk dog", "dog grooming"],
      "พาหมาเดินเล่น": ["พาสุนัขเดินเล่น"],
      "แมว": ["ดูแลแมว", "cat"],
      "cat": ["cat vet", "feed cat"],
      "สัตว์แพทย์": ["พาสัตว์เลี้ยงหาสัตว์แพทย์", "vet"],
      "vet": ["vet appointment", "pet vet"],
      "grooming": ["pet grooming", "dog grooming"],
      "อาบน้ำสุนัข": ["พาสุนัขอาบน้ำ"],

      // ============ สุขภาพ/การแพทย์ ============
      "สุข": ["สุขภาพ", "สุขภาพดี"],
      "สุขภาพ": ["ตรวจสุขภาพ", "พบแพทย์", "health", "ดูแลสุขภาพ"],
      "health": ["health checkup", "health insurance"],
      "หมอ": ["นัดหมอ", "พบหมอ", "doctor"],
      "doctor": ["doctor appointment", "medical checkup", "see doctor"],
      "แพทย์": ["พบแพทย์", "นัดแพทย์"],
      "นัดหมอ": ["นัดหมอที่โรงพยาบาล", "นัดหมอฟัน"],
      "โรงพยาบาล": ["ไปโรงพยาบาล", "hospital"],
      "hospital": ["hospital appointment", "hospital visit"],
      "คลินิก": ["ไปคลินิก", "clinic"],
      "clinic": ["clinic appointment", "dental clinic"],
      "ตรวจ": ["ตรวจสุขภาพ", "ตรวจร่างกาย", "checkup"],
      "checkup": ["health checkup", "medical checkup", "annual checkup"],
      "ตรวจสุขภาพ": ["ตรวจสุขภาพประจำปี"],
      "ตรวจเลือด": ["ตรวจเลือดที่โรงพยาบาล"],
      "blood test": ["blood test appointment"],
      "xray": ["x-ray scan", "chest x-ray"],
      "เอกซเรย์": ["เอกซเรย์ปอด"],
      "ทันตกรรม": ["นัดหมอฟัน", "dental"],
      "dental": ["dental appointment", "dental checkup"],
      "ฟัน": ["หมอฟัน", "ตรวจฟัน"],
      "หมอฟัน": ["นัดหมอฟัน", "dentist"],
      "dentist": ["dentist appointment"],
      "ถอนฟัน": ["นัดถอนฟัน"],
      "อุดฟัน": ["นัดอุดฟัน", "filling"],
      "ขูดหินปูน": ["ทำความสะอาดฟัน", "scaling"],
      "จัดฟัน": ["นัดจัดฟัน", "braces"],
      "braces": ["braces appointment", "orthodontist"],
      "ยา": ["ซื้อยา", "รับยา", "medicine"],
      "medicine": ["buy medicine", "take medicine"],
      "ร้านยา": ["ไปร้านยา", "pharmacy"],
      "pharmacy": ["go to pharmacy", "buy from pharmacy"],
      "ฉีด": ["ฉีดวัคซีน", "vaccination"],
      "vaccination": ["vaccine appointment", "get vaccinated"],
      "วัคซีน": ["ฉีดวัคซีน", "vaccine"],
      "vaccine": ["vaccine appointment"],
      "นวด": ["นวดไทย", "นวดเท้า", "massage"],
      "massage": ["thai massage", "foot massage", "body massage"],
      "นวดไทย": ["ไปนวดไทย"],
      "สปา": ["ไปสปา", "spa"],
      "spa": ["spa treatment", "spa day"],
      "ความงาม": ["ทำความงาม", "beauty"],
      "beauty": ["beauty salon", "beauty treatment"],
      "ร้านเสริมสวย": ["ไปร้านเสริมสวย", "salon"],
      "salon": ["hair salon", "beauty salon"],
      "ตัดผม": ["ตัดผมที่ร้าน", "haircut"],
      "haircut": ["get haircut"],
      "ทำผม": ["ทำผมที่ร้าน", "hair treatment"],
      "ทำเล็บ": ["ทำเล็บมือ", "manicure"],
      "manicure": ["get manicure"],
      "pedicure": ["get pedicure"],
      "เล็บมือ": ["ทำเล็บมือ"],
      "เล็บเท้า": ["ทำเล็บเท้า"],

      // ============ การเงิน/ธนาคาร ============
      "ธนาคาร": ["ไปธนาคาร", "bank", "ทำธุรกรรมธนาคาร"],
      "bank": ["go to bank", "bank appointment"],
      "atm": ["withdraw from atm"],
      "เอทีเอ็ม": ["ถอนเงินที่เอทีเอ็ม"],
      "ถอนเงิน": ["ถอนเงินที่เอทีเอ็ม", "withdraw"],
      "ฝากเงิน": ["ฝากเงินที่ธนาคาร", "deposit"],
      "โอนเงิน": ["โอนเงินผ่านธนาคาร", "transfer"],
      "transfer": ["money transfer", "bank transfer"],
      "จ่ายบิล": ["จ่ายบิลค่าน้ำค่าไฟ", "pay bills"],
      "pay": ["pay bills", "payment"],
      "bill": ["pay bills", "electricity bill"],
      "บิล": ["จ่ายบิล", "เช็คบิล"],
      "ค่าน้ำ": ["จ่ายค่าน้ำ", "water bill"],
      "ค่าไฟ": ["จ่ายค่าไฟ", "electricity bill"],
      "ค่าเน็ต": ["จ่ายค่าอินเทอร์เน็ต", "internet bill"],
      "ค่าโทรศัพท์": ["จ่ายค่าโทรศัพท์", "phone bill"],
      "ประกัน": ["ประกันสุขภาพ", "ประกันรถ", "insurance"],
      "insurance": ["health insurance", "car insurance", "life insurance"],
      "เบี้ยประกัน": ["จ่ายเบี้ยประกัน"],
      "ลงทุน": ["ลงทุนหุ้น", "investment"],
      "investment": ["investment planning", "stock investment"],
      "หุ้น": ["ซื้อหุ้น", "ขายหุ้น", "stock"],
      "stock": ["buy stock", "stock market"],
      "กองทุน": ["ลงทุนกองทุน", "fund"],
      "fund": ["mutual fund", "investment fund"],

      // ============ ยานพาหนะ/การเดินทาง ============
      "รถ": ["ขับรถ", "ล้างรถ", "เช็ครถ", "car"],
      "car": ["car service", "car wash", "drive car"],
      "ขับรถ": ["ขับรถไปทำงาน", "driving"],
      "driving": ["driving to work"],
      "ล้างรถ": ["ล้างรถที่ร้าน", "car wash"],
      "car wash": ["wash car"],
      "เช็ครถ": ["เช็ครถที่ศูนย์", "car service"],
      "service": ["car service", "car maintenance"],
      "ซ่อมรถ": ["ซ่อมรถที่อู่", "car repair"],
      "เปลี่ยนถ่ายน้ำมัน": ["เปลี่ยนน้ำมันเครื่อง", "oil change"],
      "oil change": ["car oil change"],
      "ต่อภาษี": ["ต่อภาษีรถ", "renew tax"],
      "ต่อทะเบียน": ["ต่อทะเบียนรถ"],
      "ต่อประกัน": ["ต่อประกันรถ", "renew insurance"],
      "ปั๊ม": ["ปั๊มน้ำมัน", "gas station"],
      "gas station": ["fill gas"],
      "เติมน้ำมัน": ["เติมน้ำมันรถ"],
      "ล้างยาง": ["ล้างยางรถ"],
      "เปลี่ยนยาง": ["เปลี่ยนยางรถ", "tire change"],
      "มอเตอร์ไซค์": ["ขี่มอเตอร์ไซค์", "motorcycle"],
      "motorcycle": ["motorcycle service"],
      "แท็กซี่": ["เรียกแท็กซี่", "taxi"],
      "taxi": ["call taxi", "take taxi"],
      "grab": ["เรียก grab", "grab taxi"],
      "รถเมล์": ["นั่งรถเมล์", "bus"],
      "bus": ["take bus", "bus stop"],
      "รถไฟ": ["นั่งรถไฟ", "train"],
      "train": ["take train", "train station"],
      "bts": ["นั่ง bts", "bts station"],
      "mrt": ["นั่ง mrt", "mrt station"],
      "รถไฟฟ้า": ["นั่งรถไฟฟ้า"],
      "เครื่องบิน": ["โดยสารเครื่องบิน", "airplane"],
      "airplane": ["flight booking"],
      "เที่ยวบิน": ["จองเที่ยวบิน", "flight"],
      "flight": ["flight booking", "book flight"],
      "สนามบิน": ["ไปสนามบิน", "airport"],
      "airport": ["go to airport", "airport transfer"],

      // ============ งานอดิเรก/ทักษะ ============
      "ถ่ายรูป": ["ถ่ายรูปธรรมชาติ", "photography"],
      "photography": ["photography session", "photo shoot"],
      "photo": ["take photos", "photo editing"],
      "รูป": ["ถ่ายรูป", "แต่งรูป"],
      "แต่งรูป": ["แต่งรูปใน photoshop"],
      "วาดรูป": ["วาดรูปเขียนภาพ", "drawing"],
      "drawing": ["drawing practice", "art drawing"],
      "วาด": ["วาดรูป", "วาดภาพ"],
      "ภาพ": ["วาดภาพ", "ถ่ายภาพ"],
      "ศิลปะ": ["ทำงานศิลปะ", "art"],
      "art": ["art class", "art exhibition"],
      "นิทรรศการ": ["ชมนิทรรศการ", "exhibition"],
      "exhibition": ["art exhibition", "visit exhibition"],
      "พิพิธภัณฑ์": ["ไปพิพิธภัณฑ์", "museum"],
      "museum": ["visit museum", "museum tour"],
      "study": ["study session", "online study"],
      // ============ กิจกรรมกลุ่ม/แคมป์ ============
      // เอ้าท์ติ้ง
      "เอ": ["เอ้าท์ติ้ง", "เอ้าติ้ง", "เอกสาร"],
      "เอ้า": ["เอ้าท์ติ้ง", "เอ้าติ้ง"],
      "เอ้าท์ติ้ง": ["เอ้าท์ติ้งบริษัท", "เอ้าท์ติ้งทีม", "outing"],
      "outing": ["company outing", "team outing", "office outing"],
      "เอ้าติ้ง": ["เอ้าติ้งบริษัท", "เอ้าติ้งทีม"],
      "team outing": ["team outing activity", "team outing event"],
      "company outing": ["company outing event", "company outing activity"],
      "office outing": ["office outing event", "office outing activity"],

      // ตั้งแคมป์
      "ตั้ง": ["ตั้งแคมป์", "ตั้งเต้นท์", "camping"],
      "ตั้งแคมป์": ["ตั้งแคมป์ภูเขา", "ตั้งแคมป์ริมน้ำ", "camping trip"],
      "แคมป์": ["ตั้งแคมป์", "ไปแคมป์", "camping"],
      "camping": ["camping trip", "camping weekend", "camping outdoor"],
      "camp": ["summer camp", "training camp", "camping"],
      "เต้นท์": ["ตั้งเต้นท์", "นอนเต้นท์"],
      "tent": ["tent camping", "set up tent"],
      "ตั้งเต้นท์": ["ตั้งเต้นท์ภูเขา", "ตั้งเต้นท์ริมทะเล"],
      "นอนเต้นท์": ["นอนเต้นท์ภูเขา", "นอนเต้นท์ริมทะเล"],

      // งานกลุ่ม
      "กลุ่ม": ["งานกลุ่ม", "กิจกรรมกลุ่ม", "group work"],
      "งานกลุ่ม": ["ทำงานกลุ่ม", "นัดงานกลุ่ม", "group assignment"],
      "group": ["group work", "group project", "group activity", "group meeting"],
      "กิจกรรมกลุ่ม": ["กิจกรรมกลุ่มทีม", "กิจกรรมกลุ่มบริษัท"],
      "team building": ["team building activity", "team building game"],
      "ทีมบิลดิ้ง": ["ทีมบิลดิ้งบริษัท", "กิจกรรมทีมบิลดิ้ง"],
      "ทำงานร่วมกัน": ["ทำงานร่วมกันทีม", "collaboration"],
      "collaborate": ["team collaborate", "group collaborate"],

      // เข้าค่าย
      "ค่าย": ["เข้าค่าย", "ไปค่าย", "camp"],
      "เข้าค่าย": ["เข้าค่ายลูกเสือ", "เข้าค่ายพักแรม", "เข้าค่ายอบรม"],
      "ไปค่าย": ["ไปค่ายลูกเสือ", "ไปค่ายพักแรม"],
      "ค่ายพักแรม": ["ค่ายพักแรมภูเขา", "camping"],
      "พักแรม": ["พักแรมค่าย", "overnight camp"],
      "ค่ายลูกเสือ": ["เข้าค่ายลูกเสือ", "scout camp"],
      "scout": ["scout camp", "boy scout", "girl scout"],
      "ลูกเสือ": ["ค่ายลูกเสือ", "กิจกรรมลูกเสือ"],
      "ค่ายอบรม": ["ค่ายอบรมทักษะ", "training camp"],
      "retreat": ["team retreat", "company retreat", "spiritual retreat"],
      "รีทรีต": ["รีทรีตบริษัท", "รีทรีตทีม"],
      "ค่ายภาษา": ["ค่ายภาษาอังกฤษ", "language camp"],
      "ค่ายกีฬา": ["ค่ายกีฬาฟุตบอล", "sports camp"],
    };

    // หาคำที่ใกล้เคียง
    let suggestions = [];
    
    // ตรวจสอบคำที่ตรงกัน
    for (const [key, words] of Object.entries(wordDatabase)) {
      if (lowerText.includes(key) || key.includes(lowerText)) {
        suggestions.push(...words);
      }
    }

    // เพิ่มคำที่ผู้ใช้พิมพ์เองเป็นอันดับแรก (ถ้ายังไม่มีใน suggestions)
    if (!suggestions.includes(text)) {
      suggestions.unshift(text); // เพิ่มข้างหน้าสุด
    }

    // ถ้าไม่เจอคำใกล้เคียง ให้แนะนำตามความยาวข้อความ
    if (suggestions.length === 0) {
      if (lowerText.length <= 2) {
        suggestions = [text, "สอบ", "ประชุม", "วิ่ง", "ซื้อของ", "นัดเพื่อน"];
      } else {
        // แนะนำตามหมวดหมู่ + คำที่ผู้ใช้พิมพ์
        suggestions = [text];
        if (lowerText.includes("สม")) suggestions.push("สอบ", "สอบ final", "สอบ midterm");
        else if (lowerText.includes("ป")) suggestions.push("ประชุม", "ประชุมทีม", "ปั่นจักรยาน");
        else if (lowerText.includes("วิ")) suggestions.push("วิ่ง", "วิ่งออกกำลังกาย");
        else if (lowerText.includes("ออก")) suggestions.push("ออกกำลังกาย", "ออกกำลังกายตอนเย็น");
        else suggestions.push("สอบ final", "ประชุมทีม", "วิ่งออกกำลังกาย", "ซื้อของ", "นัดเพื่อน");
      }
    }

    // ลบค่าซ้ำและจำกัดจำนวน
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 6);

    res.json({ 
      success: true, 
      suggestions: uniqueSuggestions,
      input: text,
      count: uniqueSuggestions.length,
      includesUserInput: uniqueSuggestions.includes(text)
    });
  } catch (err) {
    console.error('🔥 AI Prediction error:', err);
    // Fallback: ส่งคำที่ผู้ใช้พิมพ์กลับไป
    res.json({ 
      success: true, 
      suggestions: [text],
      input: text,
      count: 1,
      includesUserInput: true,
      isFallback: true
    });
  }
});

// ==================== AI WORKLOAD ANALYSIS ENDPOINT ====================

// วิเคราะห์ภาระงานและแนะนำตารางเวลา (ไม่รวมออกกำลังกายและส่วนตัว)
app.post("/ai/analyze-workload", async (req, res) => {
  try {
    const { user_id, date } = req.body;
    
    if (!user_id || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "ต้องการ user_id และ date" 
      });
    }

    // ดึงงานทั้งหมดของวันนั้น
    const [tasks] = await pool.query(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND start_date = ? 
       ORDER BY start_time ASC`,
      [user_id, date]
    );

    // คำนวณเวลาทำงานทั้งหมด (ไม่รวมหมวดหมู่ "ออกกำลังกาย" และ "ส่วนตัว")
    let totalWorkHours = 0;
    const workTasks = [];
    const excludedTasks = [];
    
    tasks.forEach(task => {
      if (task.category === "ออกกำลังกาย" || task.category === "ส่วนตัว") {
        excludedTasks.push(task);
      } else {
        workTasks.push(task);
        
        // คำนวณระยะเวลา
        const start = new Date(`2000-01-01T${task.start_time}`);
        const end = new Date(`2000-01-01T${task.end_time}`);
        const durationHours = (end - start) / (1000 * 60 * 60);
        totalWorkHours += durationHours;
      }
    });

    // วิเคราะห์และให้คำแนะนำ
    const analysis = analyzeWorkload(
      totalWorkHours, 
      workTasks, 
      excludedTasks,
      date
    );

    res.json({
      success: true,
      analysis,
      summary: {
        totalWorkHours: Math.round(totalWorkHours * 100) / 100,
        totalTasks: workTasks.length,
        excludedTasks: excludedTasks.length,
        date: date
      }
    });

  } catch (err) {
    console.error('🔥 AI Workload Analysis error:', err);
    res.status(500).json({ 
      success: false, 
      message: "AI analysis error", 
      error: err.message 
    });
  }
});

// ฟังก์ชันวิเคราะห์ภาระงาน
function analyzeWorkload(totalWorkHours, workTasks, excludedTasks, date) {
  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  
  let recommendations = [];
  let warnings = [];
  let availableSlots = [];
  let workloadLevel = "ปกติ";

  // วิเคราะห์ระดับภาระงาน
  if (totalWorkHours > 10) {
    workloadLevel = "หนักมาก ⚠️";
    warnings.push(`งานเกิน 10 ชั่วโมง! (${totalWorkHours.toFixed(1)} ชม.)`);
    recommendations.push("ควรลดงานลงหรือแบ่งงานบางส่วนไปทำวันอื่น");
    recommendations.push("พักเบรกทุก 1 ชั่วโมง เพื่อป้องกันความเหนื่อยล้า");
  } else if (totalWorkHours > 8) {
    workloadLevel = "หนัก 🟠";
    warnings.push(`งานค่อนข้างหนัก (${totalWorkHours.toFixed(1)} ชม.)`);
    recommendations.push("ควรพักเบรกระหว่างงานเพื่อป้องกัน burnout");
  } else if (totalWorkHours > 6) {
    workloadLevel = "ปานกลาง 🟡";
    recommendations.push("ภาระงานอยู่ในระดับที่เหมาะสม");
  } else if (totalWorkHours > 0) {
    workloadLevel = "เบา 🟢";
    recommendations.push("มีเวลาว่างพอสมควร สามารถเพิ่มงานหรือกิจกรรมได้");
  } else {
    workloadLevel = "ว่างทั้งหมด 🎉";
    recommendations.push("ไม่มีงานในวันนี้! สามารถวางแผนงานใหม่หรือพักผ่อนได้");
  }

  // วิเคราะห์การกระจายตัวของงาน
  if (workTasks.length > 0) {
    const firstTask = workTasks[0];
    const lastTask = workTasks[workTasks.length - 1];
    
    const startTime = firstTask.start_time.substring(0, 5);
    const endTime = lastTask.end_time.substring(0, 5);
    
    recommendations.push(`ทำงานตั้งแต่ ${startTime} ถึง ${endTime}`);
  }

  // ตรวจสอบว่ามีเวลาพักพอไหม
  if (workTasks.length >= 3 && totalWorkHours > 6) {
    recommendations.push("อย่าลืมพักเบรกทุก 2 ชั่วโมง");
  }

  // วิเคราะห์ช่องเวลาว่าง
  availableSlots = findAvailableTimeSlots(workTasks);

  // ตรวจสอบกิจกรรมส่วนตัวและการออกกำลังกาย
  const exerciseCount = excludedTasks.filter(task => task.category === "ออกกำลังกาย").length;
  const personalCount = excludedTasks.filter(task => task.category === "ส่วนตัว").length;

  if (exerciseCount === 0 && totalWorkHours > 6) {
    recommendations.push("ควรหาเวลาออกกำลังกายสัก 30 นาทีเพื่อสุขภาพ");
  } else if (exerciseCount > 0) {
    recommendations.push("มีการออกกำลังกายแล้ว เป็นเรื่องดี!");
  }

  if (personalCount === 0 && totalWorkHours > 8) {
    recommendations.push("ควรมีเวลาส่วนตัวเพื่อพักผ่อนและฟื้นฟูพลังงาน");
  }

  // คำแนะนำพิเศษสำหรับวันนี้
  if (isToday) {
    if (totalWorkHours > 8) {
      recommendations.push("คืนนี้ควรนอนให้เพียงพอ 7-8 ชั่วโมง");
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 18 && workTasks.length > 0) {
      recommendations.push("เย็นแล้ว ควรพักงานและผ่อนคลาย");
    } else if (currentHour < 12 && totalWorkHours > 5) {
      recommendations.push("ยังมีเวลาทำงานอีกพอสมควร จัดการเวลาดีๆ");
    }
  }

  // แนะนำกิจกรรมในช่วงเวลาว่าง
  if (availableSlots.length > 0 && totalWorkHours < 8) {
    const freeTimeSuggestions = suggestFreeTimeActivities(availableSlots, totalWorkHours);
    recommendations = recommendations.concat(freeTimeSuggestions);
  }

  // คำแนะนำตามเวลาของวัน
  const timeBasedRecommendations = getTimeBasedRecommendations();
  recommendations = recommendations.concat(timeBasedRecommendations);

  return {
    workloadLevel,
    recommendations,
    warnings,
    availableSlots,
    exerciseCount,
    personalCount
  };
}

// หาช่องเวลาว่าง
function findAvailableTimeSlots(tasks) {
  if (tasks.length === 0) {
    return [{ start: "09:00", end: "17:00", duration: 8, description: "ว่างทั้งวัน" }];
  }

  const slots = [];
  
  // เวลาเริ่มต้นและสิ้นสุดของวัน
  const dayStart = "09:00";
  const dayEnd = "21:00";

  // เรียงงานตามเวลา
  const sortedTasks = [...tasks].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  // ช่องว่างก่อนงานแรก
  if (sortedTasks[0].start_time > dayStart) {
    const duration = calculateDuration(dayStart, sortedTasks[0].start_time);
    if (duration >= 0.5) { // อย่างน้อย 30 นาที
      slots.push({
        start: dayStart,
        end: sortedTasks[0].start_time.substring(0, 5),
        duration: duration,
        description: `ว่างก่อนเริ่มงาน (${duration.toFixed(1)} ชม.)`
      });
    }
  }

  // ช่องว่างระหว่างงาน
  for (let i = 0; i < sortedTasks.length - 1; i++) {
    const currentEnd = sortedTasks[i].end_time;
    const nextStart = sortedTasks[i + 1].start_time;
    
    if (currentEnd < nextStart) {
      const duration = calculateDuration(currentEnd, nextStart);
      if (duration >= 0.5) { // อย่างน้อย 30 นาที
        slots.push({
          start: currentEnd.substring(0, 5),
          end: nextStart.substring(0, 5),
          duration: duration,
          description: `ว่างระหว่างงาน (${duration.toFixed(1)} ชม.)`
        });
      }
    }
  }

  // ช่องว่างหลังงานสุดท้าย
  const lastTask = sortedTasks[sortedTasks.length - 1];
  if (lastTask.end_time < dayEnd) {
    const duration = calculateDuration(lastTask.end_time, dayEnd);
    if (duration >= 0.5) {
      slots.push({
        start: lastTask.end_time.substring(0, 5),
        end: dayEnd,
        duration: duration,
        description: `ว่างหลังเลิกงาน (${duration.toFixed(1)} ชม.)`
      });
    }
  }

  return slots;
}

// คำนวณระยะเวลาระหว่างสองเวลา
function calculateDuration(startTime, endTime) {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end - start) / (1000 * 60 * 60);
}

// แนะนำกิจกรรมในช่วงเวลาว่าง
function suggestFreeTimeActivities(availableSlots, totalWorkHours) {
  const suggestions = [];
  
  availableSlots.forEach(slot => {
    if (slot.duration >= 1) {
      // ช่วงเวลาว่างยาวกว่า 1 ชั่วโมง
      if (slot.duration >= 2) {
        suggestions.push(`ช่วง ${slot.start}-${slot.end}: อ่านหนังสือหรือเรียนออนไลน์`);
      } else if (slot.duration >= 1.5) {
        suggestions.push(`ช่วง ${slot.start}-${slot.end}: ดูหนังสั้นหรือพักผ่อน`);
      } else {
        suggestions.push(`ช่วง ${slot.start}-${slot.end}: ดื่มกาแฟหรือนั่งพัก`);
      }
    } else if (slot.duration >= 0.5) {
      // ช่วงเวลาว่าง 30 นาที - 1 ชั่วโมง
      suggestions.push(`ช่วง ${slot.start}-${slot.end}: ยืดเส้นยืดสายหรือนั่งสมาธิ`);
    }
  });

  // คำแนะนำทั่วไปตามปริมาณงาน
  if (totalWorkHours < 6 && availableSlots.length > 2) {
    suggestions.push("มีเวลาว่างพอสมควร สามารถวางแผนงานเพิ่มได้");
  } else if (totalWorkHours === 0) {
    suggestions.push("วันนี้ว่างทั้งหมด! สามารถเพิ่มงานใหม่หรือพักผ่อนได้");
  }

  return suggestions;
}

// คำแนะนำตามเวลาของวัน
function getTimeBasedRecommendations() {
  const now = new Date();
  const hour = now.getHours();
  const recommendations = [];

  if (hour >= 5 && hour < 12) {
    recommendations.push("ตอนเช้า: เหมาะสำหรับงานที่ต้องการสมาธิสูง");
  } else if (hour >= 12 && hour < 15) {
    recommendations.push("ตอนบ่าย: หลังอาหารเที่ยง ควรทำงานเบาๆ ก่อน");
  } else if (hour >= 15 && hour < 18) {
    recommendations.push("ตอนเย็น: เหมาะสำหรับสรุปงานและวางแผนพรุ่งนี้");
  } else {
    recommendations.push("เวลาพักผ่อน: ควรทำกิจกรรมผ่อนคลาย");
  }

  return recommendations;
}

// Test
app.get('/', (req, res) => res.json({ message: 'Server is running!' }));

// Start server
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://192.168.1.108:${PORT}`);
});

async function startServer() {
  try {
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
