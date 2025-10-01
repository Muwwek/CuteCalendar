// app/(tabs)/SettingStyles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f8fafc" 
  },
  
  // Headers
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 12,
  },
  heading: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginVertical: 12,
    color: "#1e293b",
    textAlign: "center"
  },
  
  // Form Container
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: 16,
  },
  
  // Labels
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  
  // Input Fields
  input: { 
    borderWidth: 2, 
    borderColor: "#e5e7eb", 
    backgroundColor: "#ffffff",
    padding: 14, 
    borderRadius: 12,
    fontSize: 16,
    color: "#1f2937",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  
  // Picker Container
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Duration Row
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  durationInput: {
    flex: 1,
    borderWidth: 2, 
    borderColor: "#e5e7eb", 
    backgroundColor: "#ffffff",
    padding: 14, 
    borderRadius: 12,
    fontSize: 16,
    color: "#1f2937",
    textAlign: "center",
  },
  unitPicker: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  
  // Date & Time Buttons
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  
  // Deadline Button
  deadlineButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 6,
  },
  deadlineButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Reminder Toggle
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  reminderText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  
  // Add Task Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  
  // Timeline Section
  timelineSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  taskCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  timelineBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Date Groups in Timeline
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    gap: 8,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  
  // Task Cards
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  taskDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDetails: {
    gap: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  
  // Task Items (สำหรับเวอร์ชันเก่า)
  taskBlock: { 
    padding: 16, 
    borderRadius: 12, 
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Date Headers (สำหรับเวอร์ชันเก่า)
  dateHeader: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginVertical: 8,
    color: "#1e293b",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  
  // Duration Input Row (สำหรับเวอร์ชันเก่า)
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  
  durationInput: {
    flex: 1,
    borderWidth: 2, 
    borderColor: "#e5e7eb", 
    backgroundColor: "#ffffff",
    padding: 14, 
    borderRadius: 12,
    fontSize: 16,
    color: "#1f2937",
    textAlign: "center",
  },
  
  durationPickerContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  
  // Row for form elements (สำหรับเวอร์ชันเก่า)
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12,
    marginBottom: 8 
  },
  
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
    fontWeight: "500",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  
  // Button Container (สำหรับเวอร์ชันเก่า)
  buttonContainer: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Task Details (สำหรับเวอร์ชันเก่า)
  taskDetails: { 
    color: "#ffffff", 
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
  },
  
  // Task Title (สำหรับเวอร์ชันเก่า)
  taskTitle: { 
    fontWeight: "700", 
    color: "#ffffff", 
    fontSize: 18,
    marginBottom: 4,
  },
});