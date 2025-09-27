// app/(tabs)/RegisterPage.tsx
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./RegisterPageStyles";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ฟังก์ชันสำหรับ reset ค่าทั้งหมด
  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message, [
          { 
            text: "OK", 
            onPress: () => {
              // Reset form ก่อนไปหน้า login
              resetForm();
              router.push("/(tabs)/login");
            }
          },
        ]);
        
        // Reset form และเด้งไปหน้า login โดยอัตโนมัติ
        resetForm();
        setTimeout(() => {
          router.push("/(tabs)/login");
        }, 1000);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "ไม่สามารถเชื่อมต่อ server");
    }
  };

  const handleBackToLogin = () => {
    // Reset form เมื่อกดกลับไปหน้า login
    resetForm();
    router.push("/(tabs)/login");
  };

  return (
    <View style={styles.container}>
      {/* ปุ่มย้อนกลับ */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>กลับไปหน้า Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Register</Text>

      <TextInput 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername} 
        style={styles.input} 
      />
      
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput 
          placeholder="Password" 
          secureTextEntry={!showPassword} 
          value={password} 
          onChangeText={setPassword} 
          style={styles.passwordInput} 
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput 
          placeholder="Confirm Password" 
          secureTextEntry={!showConfirmPassword} 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          style={styles.passwordInput} 
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={handleRegister} />
      </View>

      {/* ปุ่ม Reset Form (optional) */}
      <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>ล้างข้อมูลทั้งหมด</Text>
      </TouchableOpacity>

      {/* ปุ่มทางเลือกสำหรับไปหน้า Login */}
      <TouchableOpacity onPress={handleBackToLogin} style={styles.loginLink}>
        <Text style={styles.loginLinkText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
}