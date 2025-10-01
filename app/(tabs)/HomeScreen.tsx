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
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    console.log("HomeScreen params:", params);

    if (params?.email && params?.username && params?.user_id) {
      setUserEmail(params.email as string);
      setUsername(params.username as string);
      setUserId(Number(params.user_id));
      console.log("✅ User data loaded:", {
        username: params.username,
        email: params.email,
        user_id: params.user_id,
      });
    } else {
      // fallback ถ้าเข้ามาโดยไม่ login
      setUserEmail("guest@example.com");
      setUsername("Guest");
      setUserId(0);
      console.log("⚠️ Using guest mode");
    }
  }, [params]);

  const handleLogout = () => {
    router.replace("/login");
  };

  // ปุ่ม "ตั้งค่างานหลัก" (ยังทำหน้าที่เดียวกับ goToSettings — แต่เก็บ semantic)
  const handleSetupWork = () => {
    if (userId === 0) {
      Alert.alert("ผิดพลาด", "กรุณาล็อกอินก่อนใช้งาน");
      return;
    }

    router.push({
      pathname: "/MainWork",
      params: {
        user_id: userId.toString(),
        username: username,
        email: userEmail,
      },
    });
  };

  // ปุ่ม shortcut ไปหน้า Settings
  const handleGoToSettings = () => {
    if (userId === 0) {
      Alert.alert("ผิดพลาด", "กรุณาล็อกอินก่อนใช้งาน");
      return;
    }

    router.push({
      pathname: "/settings",
      params: {
        user_id: userId.toString(),
        username: username,
        email: userEmail,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={50} color="#007AFF" />
          <View style={styles.userText}>
            <Text style={styles.welcomeText}>สวัสดี, {username}!</Text>
            <Text style={styles.emailText}>{userEmail}</Text>
            <Text style={styles.loginTimeText}>
              User ID: {userId} • {new Date().toLocaleString("th-TH")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>📌 Welcome to SmartPriorityLife</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>สถานะบัญชี</Text>
          {userId !== 0 ? (
            <>
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
                <Ionicons name="key" size={20} color="#F59E0B" />
                <Text style={styles.statusText}>User ID: {userId}</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="time" size={20} color="#EF4444" />
                <Text style={styles.statusText}>
                  ล็อกอินเมื่อ: {new Date().toLocaleTimeString("th-TH")}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.statusItem}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.statusText}>ยังไม่ได้ล็อกอิน</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {/* ปุ่มตั้งค่างานหลัก */}
        <TouchableOpacity
          style={[styles.button, styles.setupButton]}
          onPress={handleSetupWork}
        >
          <Ionicons name="construct-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>ตั้งค่างานหลัก</Text>
        </TouchableOpacity>

        {/* ปุ่ม shortcut ไปหน้า Settings */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#6B7280" }]}
          onPress={handleGoToSettings}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>ไปหน้า Settings</Text>
        </TouchableOpacity>

        {/* ปุ่มออกจากระบบ */}
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
