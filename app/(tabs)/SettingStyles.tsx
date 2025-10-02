// app/(tabs)/SettingsStyles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", // สีพื้นหลังอ่อนๆ
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  // Profile Card Styles
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTextContainer: {
    marginLeft: 15,
  },
  usernameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  emailText: {
    fontSize: 16,
    color: "#6B7280",
  },
  // Section Styles
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: 'hidden', // ทำให้ border radius คลุม settingRow ข้างใน
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  // Setting Row Styles
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  settingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    color: "#374151",
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 17,
    color: "#1F2937",
  },
  // Logout Styles
  logoutIcon: {
    color: "#EF4444", // สีแดง
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "500",
  },
});