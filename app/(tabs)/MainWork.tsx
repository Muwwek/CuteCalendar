// app/(tabs)/MainWork.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity, // เพิ่มเข้ามา
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router"; // เพิ่ม useRouter
import { Ionicons } from "@expo/vector-icons"; // เพิ่มเข้ามา

// นำเข้า styles จากไฟล์แยกเพื่อความเรียบร้อย
import { styles } from "./MainWorkStyles";

// Interface สำหรับ Task
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
  const router = useRouter(); // เรียกใช้ useRouter
  const { user_id } = params;

  const today = new Date().toISOString().split("T")[0];
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับเก็บวันที่ที่ถูกเลือก (เริ่มต้นเป็นวันนี้)
  const [selectedDate, setSelectedDate] = useState<string>(today);
  
  // State สำหรับเก็บรายการงานของวันที่เลือก
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState<Task[]>([]);

  const API_URL = "http://192.168.1.9:3000";

  // --- Logic การดึงข้อมูล ---
  useEffect(() => {
    const fetchTasks = async (currentUserId: number) => {
      if (!currentUserId || isNaN(currentUserId)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/tasks/${currentUserId}`);
        const data = await response.json();
        if (data.success) {
          setTasks(data.tasks);
        } else {
          Alert.alert("ผิดพลาด", data.message || "ไม่สามารถโหลดงานได้");
        }
      } catch (error) {
        Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchTasks(Number(user_id));
    } else {
      setLoading(false);
    }
  }, [user_id]);

  // --- Logic กรองงานเมื่อวันที่เลือกหรือรายการงานทั้งหมดเปลี่ยน ---
  useEffect(() => {
    const filteredTasks = tasks.filter(
      (task) => getLocalDateString(task.start_date) === selectedDate
    );
    setTasksForSelectedDay(filteredTasks);
  }, [selectedDate, tasks]);

  // --- Helper Functions ---

  // ฟังก์ชันสำหรับกลับไปหน้าหลัก
  const handleGoBack = () => {
    router.back();
  };

  // ฟังก์ชันสำหรับแปลงวันที่จาก UTC string เป็น YYYY-MM-DD ของ Local Timezone
  const getLocalDateString = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    tasks.forEach((task) => {
      const date = getLocalDateString(task.start_date);
      marked[date] = { marked: true, dotColor: "#ff4d6d" };
    });
    // ไฮไลท์วันที่ถูกเลือก
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: "#ff4d6d",
      selectedTextColor: "white",
    };
    return marked;
  };
  
  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "#f56565";
      case "medium": return "#ed8936";
      case "low": return "#48bb78";
      default: return "#a0aec0";
    }
  };
  
  // --- Render Logic ---
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4d6d" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffe6ec" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ตารางงาน</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} งานทั้งหมด</Text>
        
        {/* ปุ่มสำหรับกลับไปหน้าหลัก */}
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarWrapper}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
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
            }}
          />
        </View>
      </View>

      {/* --- UI ส่วนตารางงานที่อัปเดตตามวัน --- */}
      <View style={styles.dailyTasksContainer}>
        <Text style={styles.dailyTasksTitle}>
          รายการงานวันที่: {formatDateForDisplay(selectedDate)}
        </Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.timeCell]}>เวลา</Text>
            <Text style={[styles.headerCell, styles.taskCell]}>ชื่องาน</Text>
            <Text style={[styles.headerCell, styles.priorityCell]}>ความสำคัญ</Text>
          </View>
          <ScrollView>
            {tasksForSelectedDay.length > 0 ? (
              tasksForSelectedDay.map((task) => (
                <View key={task.id} style={styles.tableRow}>
                  <Text style={[styles.cellText, styles.timeCell]}>{task.start_time}</Text>
                  <Text style={[styles.cellText, styles.taskCell]} numberOfLines={1}>{task.title}</Text>
                  <View style={styles.priorityCell}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>
                        {task.priority === "high" ? "สูง" : task.priority === "medium" ? "กลาง" : "ต่ำ"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noTasksCard}>
                <Text style={styles.noTasksText}>🎉 ไม่มีงานสำหรับวันที่เลือก</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}