// components/MessageExamples.tsx
// ตัวอย่างการใช้งาน cute message styles

import React from 'react';
import { Text, View } from 'react-native';
import { styles as loginStyles } from '../app/(tabs)/LoginStyles';
import { styles as registerStyles } from '../app/(tabs)/RegisterPageStyles';

export const MessageExamples = () => {
  return (
    <View style={{ padding: 20, backgroundColor: '#f8f9fa' }}>
      
      {/* Login Styles Messages */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' }}>
        🎨 Login Page Messages
      </Text>
      
      <Text style={loginStyles.statusText}>
        📱 กำลังเชื่อมต่อกับเซิร์ฟเวอร์...
      </Text>
      
      <Text style={loginStyles.errorText}>
        ❌ อีเมลหรือรหัสผ่านไม่ถูกต้องค่ะ
      </Text>
      
      <Text style={loginStyles.successText}>
        ✨ เข้าสู่ระบบสำเร็จแล้ว! ยินดีต้อนรับ
      </Text>
      
      <Text style={loginStyles.warningText}>
        ⚠️ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
      </Text>
      
      <Text style={loginStyles.infoText}>
        💡 เคล็ดลับ: ใช้อีเมลที่ลงทะเบียนไว้
      </Text>

      {/* Register Styles Messages */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 20, color: '#2c3e50' }}>
        🎨 Register Page Messages
      </Text>
      
      <Text style={registerStyles.statusText}>
        📝 กำลังสร้างบัญชีผู้ใช้ใหม่...
      </Text>
      
      <Text style={registerStyles.errorText}>
        🚫 รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
      </Text>
      
      <Text style={registerStyles.successText}>
        🎉 สมัครสมาชิกเรียบร้อยแล้ว! เริ่มต้นใช้งานได้เลย
      </Text>
      
      <Text style={registerStyles.warningText}>
        🔒 รหัสผ่านควรมีตัวอักษรพิเศษด้วยนะ
      </Text>
      
      <Text style={registerStyles.statusTextSmall}>
        📧 ส่งอีเมลยืนยันแล้ว
      </Text>

      {/* Usage Tips */}
      <View style={{
        marginTop: 30,
        padding: 15,
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(52, 152, 219, 0.2)'
      }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: '#2c3e50',
          marginBottom: 10,
          textAlign: 'center' 
        }}>
          💫 วิธีการใช้งาน
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#7f8c8d',
          lineHeight: 20,
          textAlign: 'center' 
        }}>
          เลือกใช้ style ตามสถานการณ์:{'\n'}
          • statusText - แสดงสถานะปัจจุบัน{'\n'}
          • errorText - แสดงข้อผิดพลาด{'\n'}
          • successText - แสดงความสำเร็จ{'\n'}
          • warningText - แสดงคำเตือน{'\n'}
          • infoText - แสดงข้อมูลเพิ่มเติม
        </Text>
      </View>
    </View>
  );
};

export default MessageExamples;