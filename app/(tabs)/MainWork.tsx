// app/(tabs)/MainWork.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams } from "expo-router";

// ✅ นำเข้า styles จากไฟล์แยกเพื่อความเรียบร้อย
import { styles } from "./MainWorkStyles";

interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  duration_unit: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  color: string;
  reminder: number;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CalendarScreen() {
  const params = useLocalSearchParams();
  const { user_id } = params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number>(0);

  const API_URL = "http://192.168.1.9:3000";
  const today = new Date().toISOString().split("T")[0];

  // ✅✅✅ ส่วนของการ Debug อยู่ใน useEffect นี้ ✅✅✅
  useEffect(() => {
    console.log("\n--- 🕵️  เริ่ม Debug หน้า MainWork ---");
    console.log("1. ค่า Params ที่ได้รับ:", params);

    const fetchTasks = async (currentUserId: number) => {
      console.log("4. กำลังจะ Fetch ข้อมูลสำหรับ user_id:", currentUserId);

      if (!currentUserId || isNaN(currentUserId) || currentUserId === 0) {
        console.log("❌ หยุดการ Fetch เพราะ user_id ไม่ถูกต้อง:", currentUserId);
        Alert.alert("ผิดพลาด", `ไม่สามารถโหลดข้อมูลได้เนื่องจาก User ID ไม่ถูกต้อง (ID: ${currentUserId})`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/tasks/${currentUserId}`);
        
        // ตรวจสอบว่า response ที่ได้จาก server เป็น JSON จริงๆ หรือไม่
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("❌ Server ไม่ได้ตอบกลับเป็น JSON:", responseText);
          Alert.alert("ผิดพลาด", "Server ตอบกลับข้อมูลในรูปแบบที่ไม่ถูกต้อง");
          return;
        }

        console.log("5. ข้อมูลที่ได้รับจาก Server:", data);

        if (data.success) {
          setTasks(data.tasks);
          console.log(`✅ โหลดงานสำเร็จ ${data.tasks.length} รายการ`);
        } else {
          Alert.alert("ผิดพลาดจาก Server", data.message || "ไม่สามารถโหลดงานได้");
        }
      } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดระหว่างการ Fetch:", error);
        Alert.alert(
          "ผิดพลาดในการเชื่อมต่อ",
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบ IP Address และการเชื่อมต่อ Wi-Fi"
        );
      } finally {
        setLoading(false);
        console.log("--- 🕵️  สิ้นสุด Debug ---");
      }
    };

    if (user_id) {
      const id = Number(user_id);
      console.log(`2. แปลงค่า user_id จาก "${user_id}" (string) เป็น ${id} (number)`);
      
      setUserId(id);
      console.log("3. ตั้งค่า State 'userId' สำเร็จ");
      fetchTasks(id);
    } else {
      setLoading(false);
      Alert.alert("ผิดพลาด", "ไม่พบข้อมูล User ID ที่ส่งมาจากหน้าก่อนหน้า");
      console.log("❌ ไม่พบ 'user_id' ใน params");
      console.log("--- 🕵️  สิ้นสุด Debug ---");
    }
  }, [user_id]);

  const groupTasksByDate = (): Record<string, Task[]> => {
    if (!tasks || tasks.length === 0) return {};
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const date = task.start_date.split("T")[0]; // เอาเฉพาะส่วนวันที่
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    return grouped;
  };

  const tasksByDate = groupTasksByDate();

  const getMarkedDates = () => {
    const marked: Record<string, any> = {};
    Object.keys(tasksByDate).forEach((date) => {
      marked[date] = { marked: true, dotColor: "#ff4d6d" };
    });
    marked[today] = { ...marked[today], selected: true, selectedColor: "#ff4d6d" };
    if (selectedDate && selectedDate !== today) {
      marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: "#ff99ac" };
    }
    return marked;
  };

  const getTasksForSelectedDate = (): Task[] => {
    return selectedDate ? tasksByDate[selectedDate] || [] : [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#EF4444";
      case "medium": return "#F59E0B";
      case "low": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✅";
      case "in_progress": return "🔄";
      case "cancelled": return "❌";
      default: return "⏳";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffe6ec" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d6d" />
          <Text style={styles.loadingText}>กำลังโหลดงาน...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffe6ec" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MainWork</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} งานทั้งหมด</Text>
      </View>
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setModalVisible(true);
            }}
            markedDates={getMarkedDates()}
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
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📅 งานวันที่ {selectedDate}</Text>
            <View style={styles.divider} />
            <ScrollView style={styles.tasksScrollView}>
              {getTasksForSelectedDate().length > 0 ? (
                getTasksForSelectedDate().map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>
                        {getStatusIcon(task.status)} {task.title}
                      </Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(task.priority) },
                        ]}
                      >
                        <Text style={styles.priorityText}>
                          {task.priority === "high"
                            ? "สูง"
                            : task.priority === "medium"
                            ? "กลาง"
                            : "ต่ำ"}
                        </Text>
                      </View>
                    </View>
                    {task.description ? (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    ) : null}
                    <View style={styles.taskDetails}>
                      <Text style={styles.taskDetailText}>
                        ⏰ {task.start_time} - {task.end_time}
                      </Text>
                      {task.category && (
                        <Text style={styles.taskDetailText}>📁 {task.category}</Text>
                      )}
                      <Text style={styles.taskDetailText}>
                        ⏱️ {task.duration} {task.duration_unit}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noEventText}>✨ ไม่มีงานในวันนี้</Text>
              )}
            </ScrollView>
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
