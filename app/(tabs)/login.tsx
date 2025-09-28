// app/(tabs)/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { styles } from "./LoginStyles";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"correct" | "wrong" | "">("");

  useEffect(() => {
    if (params.message) {
      Alert.alert("Success", params.message.toString());
      if (params.registeredEmail) setEmail(params.registeredEmail.toString());
    }
  }, [params]);

  const API_URL = "http://localhost:3000";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter Email and Password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    setLoading(true);
    setPasswordStatus("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (data.success) {
        setPasswordStatus("correct");

        // reset input
        setEmail("");
        setPassword("");

        // send username + email to HomeScreen
        setTimeout(() => {
          router.navigate({
            pathname: "/(tabs)/HomeScreen",
            params: {
              email: data.email,
              username: data.username,
            },
          });
        }, 1000);
        
      } else {
        setPasswordStatus("wrong");
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      setPasswordStatus("wrong");
      Alert.alert("Connection Error", `Cannot connect to server\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    setPasswordStatus("");
    router.push("/(tabs)/RegisterPage");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <View style={styles.container}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Login to use SmartPriorityLife</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input, 
                passwordStatus === "wrong" && styles.inputError,
                passwordStatus === "correct" && styles.inputSuccess
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              placeholderTextColor="#95a5a6"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[
              styles.passwordContainer, 
              passwordStatus === "wrong" && styles.inputError,
              passwordStatus === "correct" && styles.inputSuccess
            ]}>
              <TextInput
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                editable={!loading}
                placeholderTextColor="#95a5a6"
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
          </View>

          {/* Status Messages */}
          {passwordStatus === "wrong" && (
            <Text style={styles.errorText}>
              <Ionicons name="alert-circle-outline" size={16} color="#e74c3c" /> 
              {" "}Incorrect email or password
            </Text>
          )}

          {passwordStatus === "correct" && (
            <Text style={styles.correctText}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#27ae60" /> 
              {" "}Login successful! Redirecting...
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <TouchableOpacity style={styles.loginButton} disabled>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Logging in...</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin} 
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                  {" "}Login
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <Text style={styles.dividerText}>or</Text>
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                <Ionicons name="person-add-outline" size={18} color="#7f8c8d" />
                {" "}Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
