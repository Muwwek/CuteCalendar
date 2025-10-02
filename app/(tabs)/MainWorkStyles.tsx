// app/(tabs)/MainWorkStyles.tsx
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

  // --- Wrapper for Scrollable Content ---
  contentWrapper: {
    flex: 1,
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

  // --- Daily Tasks (Card View) Styles ---
  dailyTasksContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 100, // เพิ่มพื้นที่ด้านล่างเผื่อปุ่ม FAB
  },
  dailyTasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    flex: 1,
    marginRight: 8,
  },
  taskCardBody: {
    marginBottom: 12,
  },
  taskCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskCardText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 8,
    lineHeight: 20,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
  },
  noTasksCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTasksText: {
    fontSize: 16,
    color: "#a0aec0",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  
  // --- Add Task FAB ---
  addTaskButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4d6d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // --- Add Task Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%', // จำกัดความสูงของ Modal
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d6d',
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  // ✅ Styles for new Date/Time/All-day picker
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginVertical: 5,
  },
  allDayText: {
    fontSize: 16,
    color: '#2d3748',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginVertical: 5,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#2d3748',
  },
  modalCalendarContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingVertical: 10,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  timePickerBox: {
    alignItems: 'center',
  },
  timePickerInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 8,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 70,
    marginVertical: 5,
  },
  timePickerSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#4a5568',
  },


  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  priorityOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityOptionText: {
    fontWeight: '600',
  },
  
  // ✅ Styles for Status Selector
  statusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statusOption: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
  },
  statusOptionText: {
      fontWeight: '600',
  },

  buttonRow: {
    marginTop: 25,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#ff4d6d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerWrapper: {
  borderWidth: 1,
  borderColor: "#e2e8f0",
  borderRadius: 8,
  marginBottom: 15,
  backgroundColor: "#fff",
},
picker: {
  height: 50,
  width: "100%",
},
deleteModalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 20,
},
deleteModalContent: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 24,
  width: '100%',
  maxWidth: 320,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
deleteModalHeader: {
  alignItems: 'center',
  marginBottom: 20,
},
deleteModalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#2d3748',
  marginTop: 12,
  textAlign: 'center',
},
deleteModalBody: {
  marginBottom: 24,
},
deleteModalText: {
  fontSize: 16,
  color: '#4a5568',
  textAlign: 'center',
  marginBottom: 8,
},
deleteModalSubText: {
  fontSize: 14,
  color: '#718096',
  textAlign: 'center',
},
deleteModalActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
},
cancelButton: {
  flex: 1,
  backgroundColor: '#e2e8f0',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
cancelButtonText: {
  color: '#4a5568',
  fontSize: 16,
  fontWeight: '600',
},
confirmDeleteButton: {
  flex: 1,
  backgroundColor: '#f56565',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
confirmDeleteButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
},
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
refreshButton: {
  padding: 8,
  borderRadius: 8,
  backgroundColor: '#f7fafc',
},
taskCardActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
deleteButton: {
  padding: 6,
  borderRadius: 6,
  backgroundColor: '#fed7d7',
},
addFirstTaskButton: {
  marginTop: 12,
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: '#ff4d6d',
  borderRadius: 8,
  alignItems: 'center',
},
addFirstTaskText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
},
headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
},

// ปุ่มรีเฟรชแบบข้อความ
refreshTextButton: {
  marginTop: 12,
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: '#ff4d6d',
  borderRadius: 8,
  alignItems: 'center',
},

refreshTextButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
},
});