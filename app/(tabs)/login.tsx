// app/(tabs)/login.tsx
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./LoginStyles";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"correct" | "wrong" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันดึง URL base ของ API
  const getApiBaseUrl = () => {
    // สำหรับ Android emulator ใช้ 10.0.2.2 เพื่อเข้าถึง localhost ของ host machine
    // สำหรับ iOS simulator และการทดสอบจริงใช้ localhost
    return "http://localhost:3000";
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "กรุณากรอก Email และ Password");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "รูปแบบ Email ไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    setPasswordStatus("");

    console.log("📱 Starting login process...");
    console.log("📧 Email:", email);

    try {
      const apiUrl = `${getApiBaseUrl()}/login`;
      console.log("🌐 Calling API:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("✅ Response status:", response.status);
      
      const data = await response.json();
      console.log("📄 Response data:", data);

      if (data.success) {
        setPasswordStatus("correct");
        console.log("🎉 Login successful!");
        
        Alert.alert("Success", data.message, [
          { 
            text: "OK", 
            onPress: () => {
              console.log("🔄 Navigating to HomeScreen...");
              router.replace("/(tabs)/HomeScreen");
            }
          }
        ]);
        
        // เด้งไปหน้า HomeScreen อัตโนมัติหลังจาก 1 วินาที
        setTimeout(() => {
          console.log("🔄 Auto-navigating to HomeScreen...");
          router.replace("/(tabs)/HomeScreen");
        }, 1000);
        
      } else {
        setPasswordStatus("wrong");
        console.log("❌ Login failed:", data.message);
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.log("💥 Network error:", error);
      setPasswordStatus("wrong");
      Alert.alert(
        "Connection Error", 
        `ไม่สามารถเชื่อมต่อ server ได้\n\nตรวจสอบว่า:\n• Server กำลังทำงานอยู่ที่ ${getApiBaseUrl()}\n• Network connection\n\nข้อผิดพลาด: ${error}`
      );
    } finally {
      setLoading(false);
      console.log("🏁 Login process finished");
    }
  };

  const handleRegister = () => {
    console.log("🔗 Navigating to RegisterPage...");
    router.push("/(tabs)/RegisterPage");
  };

  const testConnection = async () => {
    try {
      console.log("🔌 Testing server connection...");
      const apiUrl = `${getApiBaseUrl()}/`;
      console.log("Testing URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log("Server test response:", data);
      Alert.alert("Connection Test", `Server: ${data.message}\nURL: ${apiUrl}`);
    } catch (error) {
      console.log("Connection test failed:", error);
      Alert.alert("Connection Test", `ไม่สามารถเชื่อมต่อ server ได้ที่ ${getApiBaseUrl()}\n\nError: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          passwordStatus === "wrong" && styles.inputError
        ]}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
        placeholderTextColor="#999"
      />

      <View style={[
        styles.passwordContainer,
        passwordStatus === "wrong" && styles.inputError
      ]}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          editable={!loading}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
          disabled={loading}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {passwordStatus === "correct" && (
        <Text style={styles.correctText}>✅ เข้าสู่ระบบสำเร็จ</Text>
      )}
      {passwordStatus === "wrong" && (
        <Text style={styles.errorText}>❌ Email หรือ Password ไม่ถูกต้อง</Text>
      )}

      {/* ปุ่ม Login */}
      <View style={styles.buttonContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>กำลังเข้าสู่ระบบ...</Text>
          </View>
        ) : (
          <Button 
            title="Login" 
            onPress={handleLogin} 
            disabled={loading}
          />
        )}
      </View>

      {/* ปุ่ม Register */}
      <View style={styles.buttonContainer}>
        <Button 
          title="Register" 
          onPress={handleRegister} 
          color="#888" 
          disabled={loading}
        />
      </View>
    </View>
  );
}