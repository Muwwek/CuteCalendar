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
  heading: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginVertical: 12,
    color: "#1e293b",
    textAlign: "center"
  },
  
  // Form Container
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
  
  // Labels
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
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
    marginBottom: 8,
  },
  
  // Picker Container
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Button Container
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
  
  // Date Button
  dateButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 6,
  },
  
  dateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
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
  
  // Add Task Button
  addButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  
  addButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  
  // Timeline Section
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
  
  // Task Items
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
  
  taskTitle: { 
    fontWeight: "700", 
    color: "#ffffff", 
    fontSize: 18,
    marginBottom: 4,
  },
  
  taskDetails: { 
    color: "#ffffff", 
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
  },
  
  // Date Headers
  dateHeader: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginVertical: 8,
    color: "#1e293b",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  
  // Duration Input Row
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
  
  // Row for form elements
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12,
    marginBottom: 8 
  },
  
  // Empty state
  emptyState: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    fontStyle: "italic",
    paddingVertical: 32,
  },
});