// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null, // ซ่อนจาก Tab bar
        }}
      />
      <Tabs.Screen
        name="RegisterPage"
        options={{
          href: null, // ซ่อนจาก Tab bar
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "ตาราง",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // ซ่อนจาก Tab bar — เข้าได้เฉพาะ push จากหน้าอื่น
        }}
      />
      <Tabs.Screen
        name="MainWork"
        options={{
          href: null, // ซ่อนจาก Tab bar
        }}
      />
    </Tabs>
  );
}
