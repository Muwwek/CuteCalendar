// app/(tabs)/RegisterPage.tsx
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
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
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"error" | "success" | "">("");

  const API_URL = "http://localhost:3000";

  const resetForm = (all: boolean = true) => {
    if (all) {
      setUsername("");
      setEmail("");
    }
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setStatusMessage("");
    setStatusType("");
  };

  const handleRegister = async () => {
    setStatusMessage("");
    setStatusType("");

    if (!username || !email || !password || !confirmPassword) {
      setStatusMessage("Oops! You forgot to fill all fields 😅");
      setStatusType("error");
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage("Uh-oh! Passwords don't match 😢");
      setStatusType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusMessage("Hmm… that email looks funny 🤔");
      setStatusType("error");
      return;
    }

    if (password.length < 4) {
      setStatusMessage("Your password is too short 😬");
      setStatusType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password 
        }),
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: "Invalid response from server"
      }));

      if (response.ok && data.success) {
        setStatusMessage("🎉 Hooray! Registration successful!");
        setStatusType("success");

        // รีเซ็ตข้อมูลทั้งหมดทันที
        resetForm(true);

        // Navigate ไปหน้า login หลัง 1 วินาทีเพื่อให้ user เห็นข้อความ
        setTimeout(() => {
          router.navigate("/(tabs)/login");
        }, 1000);

      } else {
        // กรณีผิดพลาด รีเซ็ตเฉพาะ password เพื่อให้แก้ไขง่าย
        resetForm(false);
        setStatusMessage(`Oops! ${data?.message || "Something went wrong"} 😅`);
        setStatusType("error");
      }
    } catch (error: any) {
      resetForm(false);
      setStatusMessage("Network error 😢 Please check your connection");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    resetForm();
    router.navigate("/(tabs)/login");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin} disabled={loading}>
        <Ionicons name="arrow-back-outline" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
        placeholderTextColor="#999"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          editable={!loading}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} disabled={loading}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#7f8c8d" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.passwordInput}
          editable={!loading}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton} disabled={loading}>
          <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#7f8c8d" />
        </TouchableOpacity>
      </View>

      {/* Status message */}
      {statusMessage !== "" && (
        <Text style={[styles.statusText, statusType === "error" ? styles.errorText : styles.successText]}>
          {statusMessage}
        </Text>
      )}

      <TouchableOpacity 
        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
          <Text style={[styles.loginLink, loading && styles.loginLinkDisabled]}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
