// app/(tabs)/HomeScreen.tsx
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./HomeScreenStyles";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [userEmail, setUserEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (params.email && params.username) {
      setUserEmail(params.email as string);
      setUsername(params.username as string);
    } else {
      setUserEmail("guest@example.com");
      setUsername("Guest");
    }
  }, [params]);

  const handleLogout = () => {
    router.replace("/(tabs)/login");
  };

  const handleSetupWork = () => {
    Alert.alert("ตั้งค่างานหลัก", `ไปที่หน้าตั้งค่างานหลักสำหรับ ${username}`);
    router.push("/(tabs)/MainWork");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={50} color="#007AFF" />
          <View style={styles.userText}>
            <Text style={styles.welcomeText}>สวัสดี, {username}!</Text>
            <Text style={styles.emailText}>{userEmail}</Text>
            <Text style={styles.loginTimeText}>{new Date().toLocaleString('th-TH')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>📌 Welcome to SmartPiorityApp</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>สถานะบัญชี</Text>
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.statusText}>ล็อกอินเรียบร้อย</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="person" size={20} color="#8B5CF6" />
            <Text style={styles.statusText}>ชื่อผู้ใช้: {username}</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="mail" size={20} color="#3B82F6" />
            <Text style={styles.statusText}>อีเมล: {userEmail}</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text style={styles.statusText}>ล็อกอินเมื่อ: {new Date().toLocaleTimeString('th-TH')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.setupButton]}
          onPress={handleSetupWork}
        >
          <Ionicons name="settings" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>ตั้งค่างานหลัก</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
