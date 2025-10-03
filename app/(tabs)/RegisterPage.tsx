// app/(tabs)/RegisterPage.tsx
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
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

  const API_URL = "http://192.168.1.108:3000";

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

    if (username.length < 3) {
      setStatusMessage("Username should be at least 3 characters 😊");
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

      console.log("Registration response:", data);

      if (response.ok && data.success) {
        setStatusMessage("🎉 Hooray! Registration successful!");
        setStatusType("success");

        resetForm(true);

        setTimeout(() => {
          router.push({
            pathname: "/login",
            params: { 
              message: "Registration successful! Please login.",
              registeredEmail: email,
              registeredUserID: data.user_id?.toString() || ""
            }
          });
        }, 1500);

      } else {
        resetForm(false);
        setStatusMessage(`Oops! ${data?.message || "Something went wrong"} 😅`);
        setStatusType("error");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      resetForm(false);
      setStatusMessage("Network error 😢 Please check your connection");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    resetForm();
    router.push("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin} disabled={loading}>
          <Ionicons name="arrow-back-outline" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>

        {/* Main Title */}
        <View style={styles.header}>
          <Ionicons name="person-add" size={32} color="#008bf8" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SmartPriorityLife today!</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formCard}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color="#374151" /> Username
            </Text>
            <TextInput
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="username"
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="mail-outline" size={16} color="#374151" /> Email
            </Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="lock-closed-outline" size={16} color="#374151" /> Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeButton} 
                disabled={loading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#7f8c8d" 
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 4 && (
              <Text style={styles.passwordHint}>Password should be at least 4 characters</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="lock-closed-outline" size={16} color="#374151" /> Confirm Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.passwordInput}
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={styles.eyeButton} 
                disabled={loading}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#7f8c8d" 
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.passwordError}>Passwords don't match</Text>
            )}
          </View>

          {/* Status Message */}
          {statusMessage !== "" && (
            <View style={[
              styles.statusContainer, 
              statusType === "error" ? styles.errorContainer : styles.successContainer
            ]}>
              <Ionicons 
                name={statusType === "error" ? "alert-circle" : "checkmark-circle"} 
                size={20} 
                color={statusType === "error" ? "#ef4444" : "#10b981"} 
              />
              <Text style={[
                styles.statusText, 
                statusType === "error" ? styles.errorText : styles.successText
              ]}>
                {statusMessage}
              </Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.registerButton, 
              (loading || !username || !email || !password || !confirmPassword || password !== confirmPassword) && 
              styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={loading || !username || !email || !password || !confirmPassword || password !== confirmPassword}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#FFFFFF" />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleBackToLogin} disabled={loading}>
            <Text style={[styles.loginLink, loading && styles.loginLinkDisabled]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
