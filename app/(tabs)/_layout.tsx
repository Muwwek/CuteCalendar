// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 🚀 ซ่อน Header ทุก Tab
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
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
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // ซ่อนจาก Tab bar
        }}
      />
      <Tabs.Screen
        name="MainWork"
        options={{
          href: null, // ซ่อนจาก Tab bar
        }}
      />
      <Tabs.Screen
        name="ตาราง"
        options={{
          href: null, // ซ่อนจาก Tab bar
        }}
      />
    </Tabs>
  );
}
