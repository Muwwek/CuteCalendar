// app/(tabs)/ScheduleStyles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 5,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  searchContainer: {
    position: "relative",
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    borderColor: "#d1d5db",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 50,
    backgroundColor: "#fff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: 13,
    zIndex: 1,
  },

  // Section Header
  sectionHeaderContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: "#1f2937",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff8fab",

    // Shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // Shadow Android
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  time: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  by: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },

  // Tags - ปรับสีตามที่กำหนดใหม่
  tag: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    minWidth: 70,
  },
  workTag: {
    backgroundColor: "#6b7280", // สีเทา - Work
  },
  urgentTag: {
    backgroundColor: "#ef4444", // สีแดง - งานเร่งด่วน
  },
  secondaryTag: {
    backgroundColor: "#3b82f6", // สีน้ำเงิน - งานรอง
  },
  restTag: {
    backgroundColor: "#10b981", // สีเขียว - พักผ่อน
  },
  eventTag: {
    backgroundColor: "#f59e0b", // สีเหลือง - Event
  },
  personalTag: {
    backgroundColor: "#8b5cf6", // สีม่วง - Personal
  },
});