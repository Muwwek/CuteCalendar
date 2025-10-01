// app/(tabs)/MainWorkStyles.tsx
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6ec",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ff4d6d",
    fontWeight: "600",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#ffe6ec",
    borderBottomWidth: 1,
    borderBottomColor: "#ffccd9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff4d6d",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ff4d6d",
    marginTop: 4,
    opacity: 0.8,
  },
  calendarWrapper: {
    flex: 1,
    padding: 16,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 12,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff4d6d",
    marginBottom: 12,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ffccd9",
    marginBottom: 16,
  },
  tasksScrollView: {
    maxHeight: 400,
  },
  taskCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d6d",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d2d2d",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  taskDetails: {
    marginTop: 8,
  },
  taskDetailText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  noEventText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 32,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#ff4d6d",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});