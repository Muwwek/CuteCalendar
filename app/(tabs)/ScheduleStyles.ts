// app/(tabs)/ScheduleStyles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },

  // 🔹 ใช้กับ SectionList (หัววันที่)
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 6,
    color: "#1f2937",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",

    // Shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },

    // Shadow Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  time: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  by: {
    fontSize: 12,
    color: "#6b7280",
  },

  // 🔹 Tag สี
  tag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    color: "#fff",
    fontWeight: "600",
  },
  workTag: {
    backgroundColor: "#ef4444", // แดง
  },
  eventTag: {
    backgroundColor: "#3b82f6", // น้ำเงิน
  },
  personalTag: {
    backgroundColor: "#10b981", // เขียว
  },
  searchInput: {
    height: 40,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});
