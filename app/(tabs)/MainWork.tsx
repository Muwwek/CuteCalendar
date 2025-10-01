import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 📌 งานตัวอย่าง
  const events: Record<string, string[]> = {
    "2025-10-01": ["Meeting ทีม", "ส่งรายงานวิชา Data Analytics"],
    "2025-10-07": ["Deadline โปรเจค React"],
    "2025-10-23": ["สอบกลางภาค"],
    "2025-10-31": ["ปาร์ตี้ 🎃 Halloween"],
  };

  // 📌 วันนี้
  const today = new Date().toISOString().split("T")[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffe6ec" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MainWork</Text>
      </View>

      {/* Calendar - เต็มพื้นที่ที่เหลือ พร้อมพื้นหลังสีขาว */}
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setModalVisible(true);
            }}
            markedDates={{
              ...Object.keys(events).reduce((acc, date) => {
                acc[date] = {
                  marked: true,
                  dotColor: "#ff4d6d",
                };
                return acc;
              }, {} as Record<string, any>),
              [today]: { 
                selected: true, 
                selectedColor: "#ff4d6d",
                selectedTextColor: "white"
              },
              ...(selectedDate && selectedDate !== today
                ? { [selectedDate]: { 
                    selected: true, 
                    selectedColor: "#ff99ac",
                    selectedTextColor: "white"
                  }}
                : {}),
            }}
            theme={{
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#ff4d6d",
              selectedDayBackgroundColor: "#ff4d6d",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#ff4d6d",
              dayTextColor: "#2d2d2d",
              textDisabledColor: "#d9d9d9",
              dotColor: "#ff4d6d",
              selectedDotColor: "#ffffff",
              arrowColor: "#ff4d6d",
              monthTextColor: "#ff4d6d",
              textDayFontWeight: "600",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 18,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>
      </View>

      {/* Modal โชว์รายละเอียด */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              📅 งานวันที่ {selectedDate}
            </Text>
            <View style={styles.divider} />
            {events[selectedDate || ""] ? (
              events[selectedDate || ""].map((task, index) => (
                <View key={index} style={styles.eventItem}>
                  <Text style={styles.eventText}>• {task}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noEventText}>✨ ไม่มีงานในวันนี้</Text>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6ec",
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
    width: "85%",
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
  eventItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  eventText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  noEventText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 12,
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