// app/(tabs)/settings.tsx
import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./SettingStyles";

export default function SettingsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const API_URL = "http://192.168.1.9:3000";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (params?.user_id) {
          const idStr = params.user_id.toString();
          setUserId(idStr);
          if (params.username) setUsername(params.username.toString());
          if (params.email) setEmail(params.email.toString());
        }

        if (params?.user_id) {
          const idForFetch = params.user_id.toString();
          try {
            const res = await fetch(`${API_URL}/users/${idForFetch}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.success && mounted) {
                setUsername(data.user.username);
                setEmail(data.user.email);
                setUserId(data.user.id.toString());
              }
            }
          } catch (err) {
            Alert.alert("Connection Error", "ไม่สามารถเชื่อมต่อ API ได้");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#374151" }}>
          กำลังโหลดข้อมูลผู้ใช้...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>⚙️ Settings</Text>

      <View style={styles.formBlock}>
        <Text style={styles.label}>👤 Username</Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>{username ?? "ไม่พบข้อมูล"}</Text>

        <Text style={styles.label}>📧 Email</Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>{email ?? "ไม่พบข้อมูล"}</Text>

        <Text style={styles.label}>🆔 User ID</Text>
        <Text style={{ fontSize: 16 }}>{userId ?? "ไม่พบข้อมูล"}</Text>
      </View>

      {/* ปุ่มกลับไปหน้า Home พร้อมส่ง params กลับไปด้วย */}
      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: "#3B82F6",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
        onPress={() => {
          router.push({
            pathname: "/HomeScreen",
            params: {
              user_id: userId ?? "",
              username: username ?? "",
              email: email ?? "",
            },
          });
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 16, marginLeft: 8 }}>
          กลับไปหน้า Home
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
