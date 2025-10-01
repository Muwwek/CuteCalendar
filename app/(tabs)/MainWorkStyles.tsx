import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // --- General Styles ---
  container: {
    flex: 1,
    backgroundColor: "#ffe6ec",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe6ec",
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#ff4d6d",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ff4d6d",
    opacity: 0.8,
    marginTop: 4,
  },

  // --- Calendar Styles ---
  calendarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 12,
  },

  // --- Daily Tasks Table Styles ---
  dailyTasksContainer: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dailyTasksTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff4d6d",
    marginBottom: 12,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffccd9',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff0f3',
    borderBottomWidth: 1,
    borderColor: '#ffccd9',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ffccd9',
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4d6d',
  },
  cellText: {
    fontSize: 14,
    color: '#2d3748',
  },
  timeCell: {
    flex: 0.4,
  },
  taskCell: {
    flex: 1,
  },
  priorityCell: {
    flex: 0.5,
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  noTasksCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  noTasksText: {
    fontSize: 16,
    color: "#999",
    fontStyle: 'italic',
  },
  // สไตล์สำหรับปุ่มกลับ
backButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#ff4d6d',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  marginTop: 12,
  alignSelf: 'flex-start',
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 3,
},
backButtonText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
  marginLeft: 8,
  fontSize: 16,
},
});

