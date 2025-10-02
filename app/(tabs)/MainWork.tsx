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
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./MainWorkStyles";

// Interface สำหรับ Task
interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  duration?: number;
  duration_unit?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  color?: string;
  reminder?: number;
  priority: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Component สำหรับเลือกเวลา
const TimePicker = ({ hour, setHour, minute, setMinute }: any) => {
  const adjustTime = (unit: 'hour' | 'minute', amount: number) => {
    if (unit === 'hour') {
      const newHour = (parseInt(hour, 10) + amount + 24) % 24;
      setHour(newHour.toString().padStart(2, '0'));
    } else {
      const newMinute = (parseInt(minute, 10) + amount + 60) % 60;
      setMinute(newMinute.toString().padStart(2, '0'));
    }
  };

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerBox}>
        <TouchableOpacity onPress={() => adjustTime('hour', 1)}><Ionicons name="chevron-up" size={32} color="#ff4d6d" /></TouchableOpacity>
        <TextInput style={styles.timePickerInput} value={hour} onChangeText={setHour} keyboardType="number-pad" maxLength={2} />
        <TouchableOpacity onPress={() => adjustTime('hour', -1)}><Ionicons name="chevron-down" size={32} color="#ff4d6d" /></TouchableOpacity>
      </View>
      <Text style={styles.timePickerSeparator}>:</Text>
      <View style={styles.timePickerBox}>
        <TouchableOpacity onPress={() => adjustTime('minute', 1)}><Ionicons name="chevron-up" size={32} color="#ff4d6d" /></TouchableOpacity>
        <TextInput style={styles.timePickerInput} value={minute} onChangeText={setMinute} keyboardType="number-pad" maxLength={2} />
        <TouchableOpacity onPress={() => adjustTime('minute', -1)}><Ionicons name="chevron-down" size={32} color="#ff4d6d" /></TouchableOpacity>
      </View>
    </View>
  );
};

export default function CalendarScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user_id } = params;

  const today = new Date().toISOString().split("T")[0];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState<Task[]>([]);

  // --- State สำหรับ Modal ---
  const [isAddTaskModalVisible, setAddTaskModalVisible] = useState(false);

  // --- State สำหรับฟอร์ม ---
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("pending");
  const [isAllDay, setIsAllDay] = useState(false);
  const [newTaskStartDate, setNewTaskStartDate] = useState(today);
  const [newTaskEndDate, setNewTaskEndDate] = useState(today);
  const [newTaskStartHour, setNewTaskStartHour] = useState("09");
  const [newTaskStartMinute, setNewTaskStartMinute] = useState("00");
  const [newTaskEndHour, setNewTaskEndHour] = useState("10");
  const [newTaskEndMinute, setNewTaskEndMinute] = useState("00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const API_URL = "http://192.168.1.9:3000";

  // --- Logic การดึงข้อมูล ---
  const fetchTasks = async (currentUserId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
      } else {
        console.error('Fetch tasks error:', data);
        Alert.alert("ผิดพลาด", data.message || "ไม่สามารถโหลดงานได้");
      }
    } catch (error) {
      console.error('Fetch tasks failed:', error);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchTasks(Number(user_id));
    } else {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    const filteredTasks = tasks.filter(
      (task) => getLocalDateString(task.start_date) === selectedDate
    );
    setTasksForSelectedDay(filteredTasks);
  }, [selectedDate, tasks]);

  // --- Helper Functions ---
  const handleGoBack = () => router.back();

  // ====== แก้ตรงนี้: handleAddTask ส่งเฉพาะ field ที่ backend รองรับ ======
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่องาน");
      return;
    }

    const newTaskPayload = {
      user_id: Number(user_id),
      title: newTaskTitle,
      description: newTaskDescription,
      category: newTaskCategory || "ทั่วไป",
      priority: newTaskPriority,
      status: newTaskStatus,
      start_date: newTaskStartDate,
      end_date: newTaskEndDate,
      start_time: isAllDay ? "00:00:00" : `${newTaskStartHour}:${newTaskStartMinute}:00`,
      end_time: isAllDay ? "23:59:59" : `${newTaskEndHour}:${newTaskEndMinute}:00`,
    };

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskPayload),
      });

      // parse safely
      const text = await response.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { success: false, message: text }; }

      if (response.ok && data.success) {
        Alert.alert("สำเร็จ", "เพิ่มงานใหม่เรียบร้อยแล้ว");
        closeAndResetModal();
        if (user_id) fetchTasks(Number(user_id));
      } else {
        console.error('Add task failed:', response.status, data);
        Alert.alert("ผิดพลาด", data.message || `ไม่สามารถเพิ่มงานได้ (status ${response.status})`);
      }
    } catch (error) {
      console.error('Add task exception:', error);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const openAddTaskModal = () => {
    setNewTaskStartDate(selectedDate);
    setNewTaskEndDate(selectedDate);
    setActiveDatePicker(null);
    setShowDatePicker(false);
    setAddTaskModalVisible(true);
  };

  const closeAndResetModal = () => {
    setAddTaskModalVisible(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskCategory("");
    setNewTaskStatus("pending");
    setIsAllDay(false);
    setNewTaskStartHour("09");
    setNewTaskStartMinute("00");
    setNewTaskEndHour("10");
    setNewTaskEndMinute("00");
    setNewTaskPriority("medium");
  };

  const handleDateSelection = (day: any) => {
    if (activeDatePicker === 'start') {
      setNewTaskStartDate(day.dateString);
      if (new Date(day.dateString) > new Date(newTaskEndDate)) {
        setNewTaskEndDate(day.dateString);
      }
    } else if (activeDatePicker === 'end') {
      setNewTaskEndDate(day.dateString);
    }
    setShowDatePicker(false);
    setActiveDatePicker(null);
  };

  const getLocalDateString = (dateString: string): string => {
    if (!dateString) return '';
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
      if (!date) return;
      marked[date] = { marked: true, dotColor: "#ff4d6d" };
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: "#ff4d6d",
      selectedTextColor: "white",
    };
    return marked;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "ยังไม่ได้เลือกวันที่";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high": return { color: "#f56565", text: "สูง" };
      case "medium": return { color: "#ed8936", text: "กลาง" };
      case "low": return { color: "#48bb78", text: "ต่ำ" };
      default: return { color: "#a0aec0", text: "ไม่ระบุ" };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return { icon: "checkmark-done-circle", color: "#48bb78", text: "เสร็จสิ้น" };
      case "in_progress": return { icon: "ellipsis-horizontal-circle", color: "#4299e1", text: "กำลังทำ" };
      case "cancelled": return { icon: "close-circle", color: "#a0aec0", text: "ยกเลิก" };
      default: return { icon: "time-outline", color: "#ed8936", text: "รอดำเนินการ" };
    }
  };

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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.calendarWrapper}>
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
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

        <View style={styles.dailyTasksContainer}>
          <Text style={styles.dailyTasksTitle}>
            รายการงานวันที่: {formatDateForDisplay(selectedDate)}
          </Text>

          {tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map((task) => {
              const priorityStyle = getPriorityStyle(task.priority);
              const statusStyle = getStatusStyle(task.status);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <Text style={styles.taskCardTitle}>{task.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.color }]}>
                      <Text style={styles.priorityText}>{priorityStyle.text}</Text>
                    </View>
                  </View>

                  <View style={styles.taskCardBody}>
                    <View style={styles.taskCardRow}>
                      <Ionicons name="time-outline" size={16} color="#718096" />
                      <Text style={styles.taskCardText}>{task.start_time} - {task.end_time}</Text>
                    </View>
                    {task.description && (
                      <View style={styles.taskCardRow}>
                        <Ionicons name="reader-outline" size={16} color="#718096" />
                        <Text style={styles.taskCardText}>{task.description}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.taskCardFooter}>
                    {task.category && (
                      <View style={styles.tag}>
                        <Ionicons name="folder-outline" size={14} color="#4A5568" />
                        <Text style={styles.tagText}>{task.category}</Text>
                      </View>
                    )}
                    <View style={styles.tag}>
                      <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.color} />
                      <Text style={[styles.tagText, {color: statusStyle.color}]}>{statusStyle.text}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noTasksCard}>
              <Text style={styles.noTasksText}>🎉 ไม่มีงานสำหรับวันที่เลือก</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addTaskButton} onPress={openAddTaskModal}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={isAddTaskModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAndResetModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เพิ่มงานใหม่</Text>
              <TouchableOpacity onPress={closeAndResetModal}>
                <Ionicons name="close-circle" size={30} color="#cccccc" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.formLabel}>ชื่องาน</Text>
              <TextInput style={styles.input} placeholder="เช่น ประชุมทีม, ส่งรายงาน" value={newTaskTitle} onChangeText={setNewTaskTitle} />

              <Text style={styles.formLabel}>รายละเอียด (ถ้ามี)</Text>
              <TextInput style={[styles.input, {height: 80}]} placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงานนี้" value={newTaskDescription} onChangeText={setNewTaskDescription} multiline />

              <Text style={styles.formLabel}>หมวดหมู่</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newTaskCategory}
                    onValueChange={(itemValue) => setNewTaskCategory(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="งาน" value="งาน" />
                    <Picker.Item label="ส่วนตัว" value="ส่วนตัว" />
                    <Picker.Item label="เรียน" value="เรียน" />
                  </Picker>
                </View>


              <View style={styles.switchContainer}>
                <Text style={styles.allDayText}>ทั้งวัน (All-day)</Text>
                <Switch trackColor={{ false: "#767577", true: "#f9a8d4" }} thumbColor={isAllDay ? "#ff4d6d" : "#f4f3f4"} onValueChange={setIsAllDay} value={isAllDay} />
              </View>

              <TouchableOpacity style={styles.dateTimeRow} onPress={() => { setActiveDatePicker('start'); setShowDatePicker(true); }}>
                <Text style={styles.dateTimeLabel}>เริ่มต้น</Text>
                <Text style={styles.dateTimeValue}>{formatDateForDisplay(newTaskStartDate)} {!isAllDay && ` ${newTaskStartHour}:${newTaskStartMinute}`}</Text>
              </TouchableOpacity>
              {!isAllDay && <TimePicker hour={newTaskStartHour} setHour={setNewTaskStartHour} minute={newTaskStartMinute} setMinute={setNewTaskStartMinute} />}

              <TouchableOpacity style={styles.dateTimeRow} onPress={() => { setActiveDatePicker('end'); setShowDatePicker(true); }}>
                <Text style={styles.dateTimeLabel}>สิ้นสุด</Text>
                <Text style={styles.dateTimeValue}>{formatDateForDisplay(newTaskEndDate)} {!isAllDay && ` ${newTaskEndHour}:${newTaskEndMinute}`}</Text>
              </TouchableOpacity>
              {!isAllDay && <TimePicker hour={newTaskEndHour} setHour={setNewTaskEndHour} minute={newTaskEndMinute} setMinute={setNewTaskEndMinute} />}

              {showDatePicker && (
                <View style={styles.modalCalendarContainer}>
                  <Calendar
                    current={activeDatePicker === 'start' ? newTaskStartDate : newTaskEndDate}
                    onDayPress={handleDateSelection}
                    minDate={activeDatePicker === 'end' ? newTaskStartDate : undefined}
                    markedDates={{ [activeDatePicker === 'start' ? newTaskStartDate : newTaskEndDate]: { selected: true, selectedColor: '#ff4d6d' } }}
                  />
                </View>
              )}

              <Text style={styles.formLabel}>ความสำคัญ</Text>
              <View style={styles.prioritySelector}>
                <TouchableOpacity style={[styles.priorityOption, { backgroundColor: newTaskPriority === 'low' ? '#48bb78' : '#f7fafc', borderColor: newTaskPriority === 'low' ? '#48bb78' : '#e2e8f0' }]} onPress={() => setNewTaskPriority('low')} >
                  <Text style={[styles.priorityOptionText, { color: newTaskPriority === 'low' ? 'white' : '#4a5568' }]}>ต่ำ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.priorityOption, { backgroundColor: newTaskPriority === 'medium' ? '#ed8936' : '#f7fafc', borderColor: newTaskPriority === 'medium' ? '#ed8936' : '#e2e8f0' }]} onPress={() => setNewTaskPriority('medium')} >
                  <Text style={[styles.priorityOptionText, { color: newTaskPriority === 'medium' ? 'white' : '#4a5568' }]}>กลาง</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.priorityOption, { backgroundColor: newTaskPriority === 'high' ? '#f56565' : '#f7fafc', borderColor: newTaskPriority === 'high' ? '#f56565' : '#e2e8f0' }]} onPress={() => setNewTaskPriority('high')} >
                  <Text style={[styles.priorityOptionText, { color: newTaskPriority === 'high' ? 'white' : '#4a5568' }]}>สูง</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>สถานะ</Text>
              <View style={styles.statusSelector}>
                <TouchableOpacity style={[styles.statusOption, {backgroundColor: newTaskStatus === 'pending' ? getStatusStyle('pending').color : '#f7fafc'}]} onPress={() => setNewTaskStatus('pending')}>
                  <Text style={[styles.statusOptionText, {color: newTaskStatus === 'pending' ? 'white' : '#4a5568'}]}>รอดำเนินการ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statusOption, {backgroundColor: newTaskStatus === 'in_progress' ? getStatusStyle('in_progress').color : '#f7fafc'}]} onPress={() => setNewTaskStatus('in_progress')}>
                  <Text style={[styles.statusOptionText, {color: newTaskStatus === 'in_progress' ? 'white' : '#4a5568'}]}>กำลังทำ</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.submitButton} onPress={handleAddTask}>
                  <Text style={styles.submitButtonText}>บันทึกงาน</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
