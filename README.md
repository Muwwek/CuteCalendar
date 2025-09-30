# CuteCalendar 📅
test
แอปพลิเคชันปฏิทินน่ารักที่พัฒนาด้วย Expo และ React Native

## ข้อกำหนดในการติดตั้ง

### 1. Software ที่ต้องติดตั้งก่อน

- **Node.js** (เวอร์ชัน 18 หรือสูงกว่า) - [ดาวน์โหลดได้ที่นี่](https://nodejs.org/)
- **Git** - [ดาวน์โหลดได้ที่นี่](https://git-scm.com/)
- **MySQL** - [ดาวน์โหลดได้ที่นี่](https://dev.mysql.com/downloads/mysql/)

### 2. Mobile Development Tools

สำหรับการ develop และ test บนมือถือ:

#### สำหรับ Android:

- **Android Studio** - [ดาวน์โหลดได้ที่นี่](https://developer.android.com/studio)
- **Android SDK** (รวมอยู่ใน Android Studio)

#### สำหรับ iOS (เฉพาะ macOS):

- **Xcode** - ดาวน์โหลดจาก App Store

#### หรือใช้ Expo Go (แนะนำสำหรับ beginner):

- **Expo Go App** - ดาวน์โหลดจาก [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) หรือ [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 3. CLI Tools ที่จำเป็น

```bash
# ติดตั้ง Expo CLI
npm install -g @expo/cli

# ติดตั้ง EAS CLI (สำหรับ build production)
npm install -g eas-cli
```

## การติดตั้งและเริ่มต้นใช้งาน

### 1. Clone repository

```bash
git clone https://github.com/Muwwek/CuteCalendar.git
cd CuteCalendar
```

### 2. ติดตั้ง dependencies

```bash
npm install
```

### 3. ตั้งค่า Database

1. สร้าง MySQL database ชื่อ `UserDB`
2. แก้ไขการตั้งค่าฐานข้อมูลในไฟล์ `Backend/server.js`:

```javascript
const connection = mysql.createConnection({
  host: "localhost",
  user: "your_mysql_username",
  password: "your_mysql_password",
  database: "UserDB",
});
```

### 4. เริ่มต้น Backend Server

```bash
cd Backend
node server.js
```

### 5. เริ่มต้น Frontend App

เปิด terminal ใหม่และรัน:

```bash
npm start
# หรือ
npx expo start
```

## วิธีการรันแอป

หลังจากรัน `npm start` แล้ว คุณจะเห็นตัวเลือกในการเปิดแอป:

### สำหรับมือถือ (แนะนำ):

1. **ใช้ Expo Go** - สแกน QR Code ด้วยแอป Expo Go
2. **Android Emulator** - กด `a` ใน terminal
3. **iOS Simulator** - กด `i` ใน terminal (เฉพาะ macOS)

### สำหรับเว็บ:

- กด `w` ใน terminal หรือไปที่ http://localhost:19006

## โครงสร้างโปรเจค

```
CuteCalendar/
├── app/                    # หน้าจอต่างๆ ของแอป
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── HomeScreen.tsx      # หน้าแรก
│   │   ├── login.tsx          # หน้า Login
│   │   ├── RegisterPage.tsx   # หน้าสมัครสมาชิก
│   │   ├── schedule.tsx       # หน้าปฏิทิน/ตารางงาน
│   │   ├── MainWork.tsx       # หน้างานหลัก
│   │   └── settings.tsx       # หน้าตั้งค่า
├── Backend/               # Server-side code
│   └── server.js          # Express.js server
├── components/            # React components
├── constants/             # ค่าคงที่ (colors, themes)
└── assets/               # รูปภาพและ resources
```

## Features หลัก

- 📱 รองรับทั้ง iOS และ Android
- 🌐 รองรับ Web application
- 👤 ระบบ Login/Register
- 📅 ปฏิทินและการจัดการตารางงาน
- ⚙️ หน้าตั้งค่าส่วนตัว
- 🗄️ เชื่อมต่อกับ MySQL database

## Dependencies หลัก

### Frontend

- **Expo SDK 54** - Framework สำหรับ React Native
- **React Navigation** - การนำทางระหว่างหน้า
- **React Native DateTimePicker** - เลือกวันที่และเวลา
- **Expo Router** - File-based routing

### Backend

- **Express.js** - Web framework
- **MySQL2** - Database connector
- **bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

## การ Troubleshooting

### ปัญหาที่พบบ่อย:

1. **ไม่สามารถเชื่อมต่อ Backend**

   - ตรวจสอบว่า server รันที่ port 3000
   - ตรวจสอบการตั้งค่า MySQL connection

2. **Metro bundler ไม่ทำงาน**

   ```bash
   npx expo start --clear
   ```

3. **Dependencies ขัดแย้งกัน**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Android build ผิดพลาด**
   - ตรวจสอบ Android SDK path
   - ลองใช้ Expo Go แทน

## สคริปต์ที่ใช้ได้

```bash
npm start          # เริ่ม development server
npm run android    # รันบน Android emulator
npm run ios        # รันบน iOS simulator
npm run web        # รันบน web browser
npm run lint       # ตรวจสอบ code style
npm run reset-project  # รีเซ็ตโปรเจค
```

## การพัฒนาต่อ

- แก้ไขไฟล์ใน **app/** directory
- ใช้ [file-based routing](https://docs.expo.dev/router/introduction/) ของ Expo Router
- ปรับแต่ง styles ในไฟล์ \*Styles.tsx ของแต่ละหน้า

## เอกสารและแหล่งข้อมูล

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## License

ISC License

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
