// app/(tabs)/setting.tsx
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
import { styles } from "./MainWorkStyles"; // ใช้ styles เดียวกัน

interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

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
        <TouchableOpacity onPress={() => adjustTime('hour', 1)}>
          <Ionicons name="chevron-up" size={32} color="#ff4d6d" />
        </TouchableOpacity>
        <TextInput
          style={styles.timePickerInput}
          value={hour}
          onChangeText={setHour}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TouchableOpacity onPress={() => adjustTime('hour', -1)}>
          <Ionicons name="chevron-down" size={32} color="#ff4d6d" />
        </TouchableOpacity>
      </View>
      <Text style={styles.timePickerSeparator}>:</Text>
      <View style={styles.timePickerBox}>
        <TouchableOpacity onPress={() => adjustTime('minute', 1)}>
          <Ionicons name="chevron-up" size={32} color="#ff4d6d" />
        </TouchableOpacity>
        <TextInput
          style={styles.timePickerInput}
          value={minute}
          onChangeText={setMinute}
          keyboardType="number-pad"
          maxLength={2}
        />
        <TouchableOpacity onPress={() => adjustTime('minute', -1)}>
          <Ionicons name="chevron-down" size={32} color="#ff4d6d" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function SettingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user_id } = params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // State สำหรับฟอร์มแก้ไข
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAllDay, setIsAllDay] = useState(false);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartHour, setEditStartHour] = useState("09");
  const [editStartMinute, setEditStartMinute] = useState("00");
  const [editEndHour, setEditEndHour] = useState("10");
  const [editEndMinute, setEditEndMinute] = useState("00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);

  const API_URL = "http://192.168.1.9:3000";

  // ดึงข้อมูล tasks ทั้งหมดของ user
  const fetchTasks = async (currentUserId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${currentUserId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
      } else {
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

  // เปิด Modal แก้ไข
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditCategory(task.category || "");
    setEditStatus(task.status);
    setEditPriority(task.priority as "low" | "medium" | "high");
    setEditStartDate(getLocalDateString(task.start_date));
    setEditEndDate(getLocalDateString(task.end_date));
    
    const [startHour, startMinute] = task.start_time.split(':');
    const [endHour, endMinute] = task.end_time.split(':');
    setEditStartHour(startHour);
    setEditStartMinute(startMinute);
    setEditEndHour(endHour);
    setEditEndMinute(endMinute);
    
    setIsAllDay(task.start_time === "00:00:00" && task.end_time === "23:59:59");
    setEditModalVisible(true);
  };

  // ปิด Modal และรีเซ็ตค่า
  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedTask(null);
    setShowDatePicker(false);
    setActiveDatePicker(null);
  };

  // บันทึกการแก้ไข
  const handleUpdateTask = async () => {
    if (!editTitle.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่องาน");
      return;
    }

    if (!selectedTask) return;

    const updatedTaskPayload = {
      title: editTitle,
      description: editDescription,
      category: editCategory || "ทั่วไป",
      priority: editPriority,
      status: editStatus,
      start_date: editStartDate,
      end_date: editEndDate,
      start_time: isAllDay ? "00:00:00" : `${editStartHour}:${editStartMinute}:00`,
      end_time: isAllDay ? "23:59:59" : `${editEndHour}:${editEndMinute}:00`,
    };

    try {
      const response = await fetch(`${API_URL}/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTaskPayload),
      });

      const text = await response.text();
      let data: any = {};
      try { 
        data = text ? JSON.parse(text) : {}; 
      } catch (e) { 
        data = { success: false, message: text }; 
      }

      if (response.ok && data.success) {
        Alert.alert("สำเร็จ", "อัพเดทงานเรียบร้อยแล้ว");
        closeEditModal();
        if (user_id) fetchTasks(Number(user_id));
      } else {
        Alert.alert("ผิดพลาด", data.message || "ไม่สามารถอัพเดทงานได้");
      }
    } catch (error) {
      console.error('Update task exception:', error);
      Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ลบงาน
  const handleDeleteTask = async (taskId: number) => {
    Alert.alert(
      "ยืนยันการลบ",
      "คุณต้องการลบงานนี้ใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
              });
              const data = await response.json();

              if (response.ok && data.success) {
                Alert.alert("สำเร็จ", "ลบงานเรียบร้อยแล้ว");
                if (user_id) fetchTasks(Number(user_id));
              } else {
                Alert.alert("ผิดพลาด", data.message || "ไม่สามารถลบงานได้");
              }
            } catch (error) {
              console.error('Delete task exception:', error);
              Alert.alert("ผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
            }
          },
        },
      ]
    );
  };

  // Helper Functions
  const handleGoBack = () => router.back();

  const getLocalDateString = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const handleDateSelection = (day: any) => {
    if (activeDatePicker === 'start') {
      setEditStartDate(day.dateString);
      if (new Date(day.dateString) > new Date(editEndDate)) {
        setEditEndDate(day.dateString);
      }
    } else if (activeDatePicker === 'end') {
      setEditEndDate(day.dateString);
    }
    setShowDatePicker(false);
    setActiveDatePicker(null);
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
        <Text style={styles.headerTitle}>จัดการงานทั้งหมด</Text>
        <Text style={styles.headerSubtitle}>{tasks.length} งานทั้งหมด</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.dailyTasksContainer}>
          {tasks.length > 0 ? (
            tasks.map((task) => {
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
                      <Ionicons name="calendar-outline" size={16} color="#718096" />
                      <Text style={styles.taskCardText}>
                        {formatDateForDisplay(task.start_date)}
                      </Text>
                    </View>
                    <View style={styles.taskCardRow}>
                      <Ionicons name="time-outline" size={16} color="#718096" />
                      <Text style={styles.taskCardText}>
                        {task.start_time} - {task.end_time}
                      </Text>
                    </View>
                    {task.description && (
                      <View style={styles.taskCardRow}>
                        <Ionicons name="reader-outline" size={16} color="#718096" />
                        <Text style={styles.taskCardText}>{task.description}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.taskCardFooter}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {task.category && (
                        <View style={styles.tag}>
                          <Ionicons name="folder-outline" size={14} color="#4A5568" />
                          <Text style={styles.tagText}>{task.category}</Text>
                        </View>
                      )}
                      <View style={styles.tag}>
                        <Ionicons name={statusStyle.icon as any} size={14} color={statusStyle.color} />
                        <Text style={[styles.tagText, { color: statusStyle.color }]}>
                          {statusStyle.text}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => openEditModal(task)}
                        style={{
                          backgroundColor: '#4299e1',
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons name="pencil" size={18} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTask(task.id)}
                        style={{
                          backgroundColor: '#f56565',
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons name="trash" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noTasksCard}>
              <Text style={styles.noTasksText}>📋 ยังไม่มีงานในระบบ</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal แก้ไขงาน */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>แก้ไขงาน</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close-circle" size={30} color="#cccccc" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.formLabel}>ชื่องาน</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น ประชุมทีม, ส่งรายงาน"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text style={styles.formLabel}>รายละเอียด (ถ้ามี)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงานนี้"
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
              />

              <Text style={styles.formLabel}>หมวดหมู่</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={editCategory}
                  onValueChange={(itemValue) => setEditCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="งาน" value="งาน" />
                  <Picker.Item label="ส่วนตัว" value="ส่วนตัว" />
                  <Picker.Item label="เรียน" value="เรียน" />
                </Picker>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.allDayText}>ทั้งวัน (All-day)</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#f9a8d4" }}
                  thumbColor={isAllDay ? "#ff4d6d" : "#f4f3f4"}
                  onValueChange={setIsAllDay}
                  value={isAllDay}
                />
              </View>

              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => {
                  setActiveDatePicker('start');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateTimeLabel}>เริ่มต้น</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDateForDisplay(editStartDate)}
                  {!isAllDay && ` ${editStartHour}:${editStartMinute}`}
                </Text>
              </TouchableOpacity>
              {!isAllDay && (
                <TimePicker
                  hour={editStartHour}
                  setHour={setEditStartHour}
                  minute={editStartMinute}
                  setMinute={setEditStartMinute}
                />
              )}

              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => {
                  setActiveDatePicker('end');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateTimeLabel}>สิ้นสุด</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDateForDisplay(editEndDate)}
                  {!isAllDay && ` ${editEndHour}:${editEndMinute}`}
                </Text>
              </TouchableOpacity>
              {!isAllDay && (
                <TimePicker
                  hour={editEndHour}
                  setHour={setEditEndHour}
                  minute={editEndMinute}
                  setMinute={setEditEndMinute}
                />
              )}

              {showDatePicker && (
                <View style={styles.modalCalendarContainer}>
                  <Calendar
                    current={activeDatePicker === 'start' ? editStartDate : editEndDate}
                    onDayPress={handleDateSelection}
                    minDate={activeDatePicker === 'end' ? editStartDate : undefined}
                    markedDates={{
                      [activeDatePicker === 'start' ? editStartDate : editEndDate]: {
                        selected: true,
                        selectedColor: '#ff4d6d'
                      }
                    }}
                  />
                </View>
              )}

              <Text style={styles.formLabel}>ความสำคัญ</Text>
              <View style={styles.prioritySelector}>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    {
                      backgroundColor: editPriority === 'low' ? '#48bb78' : '#f7fafc',
                      borderColor: editPriority === 'low' ? '#48bb78' : '#e2e8f0'
                    }
                  ]}
                  onPress={() => setEditPriority('low')}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      { color: editPriority === 'low' ? 'white' : '#4a5568' }
                    ]}
                  >
                    ต่ำ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    {
                      backgroundColor: editPriority === 'medium' ? '#ed8936' : '#f7fafc',
                      borderColor: editPriority === 'medium' ? '#ed8936' : '#e2e8f0'
                    }
                  ]}
                  onPress={() => setEditPriority('medium')}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      { color: editPriority === 'medium' ? 'white' : '#4a5568' }
                    ]}
                  >
                    กลาง
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityOption,
                    {
                      backgroundColor: editPriority === 'high' ? '#f56565' : '#f7fafc',
                      borderColor: editPriority === 'high' ? '#f56565' : '#e2e8f0'
                    }
                  ]}
                  onPress={() => setEditPriority('high')}
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      { color: editPriority === 'high' ? 'white' : '#4a5568' }
                    ]}
                  >
                    สูง
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>สถานะ</Text>
              <View style={styles.statusSelector}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor:
                        editStatus === 'pending' ? getStatusStyle('pending').color : '#f7fafc'
                    }
                  ]}
                  onPress={() => setEditStatus('pending')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: editStatus === 'pending' ? 'white' : '#4a5568' }
                    ]}
                  >
                    รอดำเนินการ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor:
                        editStatus === 'in_progress'
                          ? getStatusStyle('in_progress').color
                          : '#f7fafc'
                    }
                  ]}
                  onPress={() => setEditStatus('in_progress')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: editStatus === 'in_progress' ? 'white' : '#4a5568' }
                    ]}
                  >
                    กำลังทำ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor:
                        editStatus === 'completed'
                          ? getStatusStyle('completed').color
                          : '#f7fafc'
                    }
                  ]}
                  onPress={() => setEditStatus('completed')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: editStatus === 'completed' ? 'white' : '#4a5568' }
                    ]}
                  >
                    เสร็จสิ้น
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.submitButton} onPress={handleUpdateTask}>
                  <Text style={styles.submitButtonText}>บันทึกการแก้ไข</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}