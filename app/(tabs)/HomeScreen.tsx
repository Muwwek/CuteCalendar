// app/(tabs)/index.tsx
import { Text, View, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 Welcome to Smart App</Text>
      <Text style={styles.subtitle}>นี่คือหน้าแรกหลัง Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // เทียบเท่า bg-white
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: "bold",
  },
  subtitle: {
    color: "#4b5563", // text-gray-600
    marginTop: 8, // mt-2
    fontSize: 14,
  },
});
