// app/(tabs)/MainWork.tsx
import React, { useState, useEffect, useCallback } from "react";
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
  RefreshControl,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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
  const [refreshing, setRefreshing] = useState(false);
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

  // --- State สำหรับ AI ---
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  // --- State สำหรับ AI Workload Analysis ---
  const [workloadAnalysis, setWorkloadAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedDate, setLastAnalyzedDate] = useState<string | null>(null);

  const API_URL = "http://192.168.1.108:3000";

  // ====== ฟังก์ชันทำนายคำ Real-time ======
  const handleTextPrediction = async (text: string) => {
    setNewTaskTitle(text);
    
    if (text.length > 0) {
      try {
        const response = await fetch(`${API_URL}/ai/predict-task`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        
        const data = await response.json();
        if (data.success && data.suggestions.length > 0) {
          setPredictions(data.suggestions);
          setShowPredictions(true);
        } else {
          setShowPredictions(false);
        }
      } catch (error) {
        // ไม่แสดง error สำหรับ real-time
        setShowPredictions(false);
      }
    } else {
      setShowPredictions(false);
    }
  };

  // ====== ฟังก์ชัน AI Suggestion ======
  const handleAiSuggest = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("กรุณากรอกชื่องานก่อน", "โปรดระบุชื่องานเพื่อให้ AI สามารถแนะนำได้");
      return;
    }

    setIsAiLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/ai/suggest-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTaskTitle }),
      });

      const data = await response.json();
      
      if (data.success && data.suggestion) {
        // ✅ ดึงค่าจาก backend มาใส่ใน state ของฟอร์ม
        if (data.suggestion.category) {
          setNewTaskCategory(data.suggestion.category);
        }
        if (data.suggestion.priority) {
          setNewTaskPriority(data.suggestion.priority);
        }
        if (data.suggestion.description) {
          setNewTaskDescription(data.suggestion.description);
        }

        // ✅ แจ้งเตือนแบบสั้น ๆ
        Alert.alert(
          "🎯 AI แนะนำให้คุณ", 
          `หมวดหมู่: ${data.suggestion.category || 'ไม่ระบุ'}\nความสำคัญ: ${data.suggestion.priority || 'ไม่ระบุ'}\n\nคำอธิบาย: ${data.suggestion.description || 'ไม่มีคำอธิบาย'}`
        );
      } else {
        Alert.alert("ขออภัย", "AI ไม่สามารถให้คำแนะนำได้ในขณะนี้");
      }
    } catch (error) {
      console.error('AI Suggestion error:', error);
      Alert.alert("การเชื่อมต่อล้มเหลว", "ไม่สามารถเชื่อมต่อกับบริการ AI ได้ในขณะนี้");
    } finally {
      setIsAiLoading(false);
    }
  };

  // ====== ฟังก์ชัน AI Workload Analysis ======
  const analyzeWorkload = async () => {
    if (!user_id) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/ai/analyze-workload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: Number(user_id), 
          date: selectedDate 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setWorkloadAnalysis(data);
        setLastAnalyzedDate(selectedDate); // บันทึกวันที่ที่วิเคราะห์ล่าสุด
        // แสดงผลลัพธ์ใน Alert
        showWorkloadAnalysis(data);
      } else {
        Alert.alert("ขออภัย", "ไม่สามารถวิเคราะห์ภาระงานได้ในขณะนี้");
      }
    } catch (error) {
      console.error('Workload analysis error:', error);
      Alert.alert("การเชื่อมต่อล้มเหลว", "ไม่สามารถเชื่อมต่อกับบริการวิเคราะห์ได้");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // แสดงผลการวิเคราะห์
  const showWorkloadAnalysis = (data: any) => {
    const { analysis, summary } = data;
    
    let message = `📊 วิเคราะห์ภาระงานวันที่ ${formatDateForDisplay(selectedDate)}\n\n`;
    message += `⏱️ ทำงานทั้งหมด: ${summary.totalWorkHours} ชั่วโมง\n`;
    message += `📝 จำนวนงาน: ${summary.totalTasks} งาน\n`;
    message += `🚫 ไม่รวม: ออกกำลังกาย ${analysis.exerciseCount} งาน, ส่วนตัว ${analysis.personalCount} งาน\n\n`;
    
    message += `📈 ระดับภาระงาน: ${analysis.workloadLevel}\n\n`;
    
    if (analysis.warnings.length > 0) {
      message += `⚠️ คำเตือน:\n`;
      analysis.warnings.forEach((warning: string) => {
        message += `• ${warning}\n`;
      });
      message += `\n`;
    }
    
    message += `💡 คำแนะนำ:\n`;
    analysis.recommendations.forEach((rec: string, index: number) => {
      message += `${index + 1}. ${rec}\n`;
    });

    // แสดงช่องเวลาว่างถ้ามี
    if (analysis.availableSlots.length > 0) {
      message += `\n🕒 ช่วงเวลาว่าง:\n`;
      analysis.availableSlots.forEach((slot: any, index: number) => {
        message += `${index + 1}. ${slot.description}\n`;
      });
    }

    Alert.alert(
      "🤖 AI วิเคราะห์ภาระงาน",
      message,
      [
        { text: "เข้าใจแล้ว", style: "default" },
        { text: "ปิด", style: "cancel" }
      ]
    );
  };

  // --- Logic การดึงข้อมูล ---
  const fetchTasks = async (currentUserId: number) => {
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
      setRefreshing(false);
    }
  };

  // 🔄 โหลดข้อมูลใหม่เมื่อโฟกัสหน้านี้
  useFocusEffect(
    useCallback(() => {
      if (user_id) {
        fetchTasks(Number(user_id));
      }
    }, [user_id])
  );

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
    
    // เรียงลำดับตาม priority และเวลา
    const sortedTasks = filteredTasks.sort((a, b) => {
      // กำหนดค่าความสำคัญ (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      // ถ้า priority เท่ากัน ให้เรียงตามเวลาเริ่มต้น
      if (bPriority !== aPriority) {
        return bPriority - aPriority; // เรียงจากสูงไปต่ำ
      } else {
        // เปรียบเทียบเวลาเริ่มต้น
        return a.start_time.localeCompare(b.start_time);
      }
    });
    
    setTasksForSelectedDay(sortedTasks);
    
    // เคลียร์การวิเคราะห์เมื่อเปลี่ยนวัน (ยกเว้นถ้าวันที่ยังคงเดิม)
    if (lastAnalyzedDate !== selectedDate) {
      setWorkloadAnalysis(null);
    }
  }, [selectedDate, tasks]);

  // 🔄 ฟังก์ชันดึงข้อมูลใหม่ (Pull-to-Refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user_id) {
      fetchTasks(Number(user_id));
    } else {
      setRefreshing(false);
    }
  }, [user_id]);

  // --- Helper Functions ---
  const handleGoBack = () => router.back();

  // ====== handleAddTask ที่อัพเดทข้อมูลอัตโนมัติ ======
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
        // 🔄 โหลดข้อมูลใหม่หลังจากเพิ่มสำเร็จ
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

  // ====== ฟังก์ชันลบงานที่อัพเดทข้อมูลอัตโนมัติ ======
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
                // 🔄 โหลดข้อมูลใหม่หลังจากลบสำเร็จ
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
    setIsAiLoading(false);
    setShowPredictions(false);
    setPredictions([]);
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

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff4d6d"]}
            tintColor="#ff4d6d"
          />
        }
      >
        <View style={styles.calendarWrapper}>
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                // เคลียร์การวิเคราะห์เมื่อเลือกวันใหม่
                if (lastAnalyzedDate !== day.dateString) {
                  setWorkloadAnalysis(null);
                }
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

        <View style={styles.dailyTasksContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.dailyTasksTitle}>
              รายการงานวันที่: {formatDateForDisplay(selectedDate)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={20} color="#ff4d6d" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.refreshButton, isAnalyzing && { opacity: 0.5 }]}
                onPress={analyzeWorkload}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#ff4d6d" />
                ) : (
                  <Ionicons name="analytics" size={20} color="#ff4d6d" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* การวิเคราะห์ภาระงาน - แสดงเฉพาะเมื่อมีการวิเคราะห์สำหรับวันที่เลือกอยู่ */}
          {workloadAnalysis && lastAnalyzedDate === selectedDate && (
            <TouchableOpacity 
              style={[
                styles.analysisContainer,
                workloadAnalysis.analysis.workloadLevel.includes('หนักมาก') && styles.workloadHeavy,
                workloadAnalysis.analysis.workloadLevel.includes('หนัก') && styles.workloadHeavy,
                workloadAnalysis.analysis.workloadLevel.includes('ปานกลาง') && styles.workloadMedium,
                workloadAnalysis.analysis.workloadLevel.includes('เบา') && styles.workloadLight,
              ]}
              onPress={() => showWorkloadAnalysis(workloadAnalysis)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.analysisTitle}>
                    🤖 วิเคราะห์ภาระงาน
                  </Text>
                  <Text style={styles.analysisText}>
                    ⏱️ ทำงาน {workloadAnalysis.summary.totalWorkHours} ชม. จาก {workloadAnalysis.summary.totalTasks} งาน
                  </Text>
                  <Text style={styles.analysisText}>
                    📈 ระดับ: {workloadAnalysis.analysis.workloadLevel}
                  </Text>
                  <Text style={styles.analysisText}>
                    💡 {workloadAnalysis.analysis.recommendations[0]}
                  </Text>
                  {workloadAnalysis.analysis.warnings.length > 0 && (
                    <Text style={styles.warningText}>
                      ⚠️ {workloadAnalysis.analysis.warnings[0]}
                    </Text>
                  )}
                </View>
                <Ionicons name="information-circle" size={20} color="#718096" />
              </View>
            </TouchableOpacity>
          )}

          {/* ปุ่มแนะนำให้วิเคราะห์ - แสดงเฉพาะเมื่อยังไม่ได้วิเคราะห์สำหรับวันที่นี้ */}
          {!workloadAnalysis && (
            <TouchableOpacity 
              style={styles.suggestionCard}
              onPress={analyzeWorkload}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="bulb-outline" size={24} color="#ff4d6d" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>อยากรู้ว่าวันนี้ยุ่งแค่ไหน?</Text>
                  <Text style={styles.suggestionText}>กดเพื่อให้ AI วิเคราะห์ภาระงานและแนะนำตารางเวลา</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
              </View>
            </TouchableOpacity>
          )}

          {tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map((task) => {
              const priorityStyle = getPriorityStyle(task.priority);
              const statusStyle = getStatusStyle(task.status);
              return (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <Text style={styles.taskCardTitle}>{task.title}</Text>
                    <View style={styles.taskCardActions}>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.color }]}>
                        <Text style={styles.priorityText}>{priorityStyle.text}</Text>
                      </View>
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
              <TouchableOpacity 
                style={styles.addFirstTaskButton}
                onPress={openAddTaskModal}
              >
                <Text style={styles.addFirstTaskText}>เพิ่มงานแรกของคุณ</Text>
              </TouchableOpacity>
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
              <View style={styles.inputContainer}>
                <TextInput 
                  style={[styles.input, styles.colortext]} 
                  placeholder="เช่น ประชุมทีม, ส่งรายงาน..." 
                  value={newTaskTitle} 
                  onChangeText={handleTextPrediction}
                />

                {/* ✅ Real-time Prediction Dropdown */}
                {showPredictions && predictions.length > 0 && (
                  <View style={styles.predictionDropdown}>
                    <ScrollView 
                      style={styles.predictionScrollView}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {predictions.map((prediction, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setNewTaskTitle(prediction);
                            setShowPredictions(false);
                          }}
                          style={[
                            styles.predictionItem,
                            index < predictions.length - 1 && styles.predictionItemBorder
                          ]}
                        >
                          <Ionicons name="bulb-outline" size={16} color="#ff4d6d" style={{marginRight: 8}} />
                          <Text style={styles.predictionText}>{prediction}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              {/* ✅ ปุ่ม AI Suggestion */}
              <TouchableOpacity
                onPress={handleAiSuggest}
                disabled={isAiLoading}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isAiLoading ? "#f0f0f0" : "#ffe6ec",
                  padding: 12,
                  borderRadius: 8,
                  marginVertical: 8,
                  borderWidth: 1,
                  borderColor: "#ff4d6d",
                }}
              >
                {isAiLoading ? (
                  <ActivityIndicator size="small" color="#ff4d6d" />
                ) : (
                  <Ionicons name="sparkles-outline" size={20} color="#ff4d6d" />
                )}
                <Text style={{ 
                  marginLeft: 8, 
                  color: isAiLoading ? "#999" : "#ff4d6d", 
                  fontWeight: "900",
                  fontSize: 14 
                }}>
                  {isAiLoading ? "AI กำลังวิเคราะห์..." : "ให้ AI ช่วยแนะนำ"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>รายละเอียด (ถ้ามี)</Text>
              <TextInput 
                style={[styles.input, {height: 80}, styles.colortext]} 
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงานนี้" 
                value={newTaskDescription} 
                onChangeText={setNewTaskDescription} 
                multiline 
              />

              <Text style={styles.formLabel}>หมวดหมู่</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newTaskCategory}
                    onValueChange={(itemValue) => setNewTaskCategory(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="เลือกหมวดหมู่" value="" />
                    <Picker.Item label="งาน" value="งาน" />
                    <Picker.Item label="ส่วนตัว" value="ส่วนตัว" />
                    <Picker.Item label="เรียน" value="เรียน" />
                    <Picker.Item label="ออกกำลังกาย" value="ออกกำลังกาย" />
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
                onPress={() => { setActiveDatePicker('start'); setShowDatePicker(true); }}
              >
                <Text style={styles.dateTimeLabel}>เริ่มต้น</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDateForDisplay(newTaskStartDate)} {!isAllDay && ` ${newTaskStartHour}:${newTaskStartMinute}`}
                </Text>
              </TouchableOpacity>
              {!isAllDay && <TimePicker hour={newTaskStartHour} setHour={setNewTaskStartHour} minute={newTaskStartMinute} setMinute={setNewTaskStartMinute} />}

              <TouchableOpacity 
                style={styles.dateTimeRow} 
                onPress={() => { setActiveDatePicker('end'); setShowDatePicker(true); }}
              >
                <Text style={styles.dateTimeLabel}>สิ้นสุด</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDateForDisplay(newTaskEndDate)} {!isAllDay && ` ${newTaskEndHour}:${newTaskEndMinute}`}
                </Text>
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
                <TouchableOpacity 
                  style={[
                    styles.priorityOption, 
                    { 
                      backgroundColor: newTaskPriority === 'low' ? '#48bb78' : '#f7fafc', 
                      borderColor: newTaskPriority === 'low' ? '#48bb78' : '#e2e8f0' 
                    }
                  ]} 
                  onPress={() => setNewTaskPriority('low')} 
                >
                  <Text style={[
                    styles.priorityOptionText, 
                    { color: newTaskPriority === 'low' ? 'white' : '#4a5568' }
                  ]}>ต่ำ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.priorityOption, 
                    { 
                      backgroundColor: newTaskPriority === 'medium' ? '#ed8936' : '#f7fafc', 
                      borderColor: newTaskPriority === 'medium' ? '#ed8936' : '#e2e8f0' 
                    }
                  ]} 
                  onPress={() => setNewTaskPriority('medium')} 
                >
                  <Text style={[
                    styles.priorityOptionText, 
                    { color: newTaskPriority === 'medium' ? 'white' : '#4a5568' }
                  ]}>กลาง</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.priorityOption, 
                    { 
                      backgroundColor: newTaskPriority === 'high' ? '#f56565' : '#f7fafc', 
                      borderColor: newTaskPriority === 'high' ? '#f56565' : '#e2e8f0' 
                    }
                  ]} 
                  onPress={() => setNewTaskPriority('high')} 
                >
                  <Text style={[
                    styles.priorityOptionText, 
                    { color: newTaskPriority === 'high' ? 'white' : '#4a5568' }
                  ]}>สูง</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>สถานะ</Text>
              <View style={styles.statusSelector}>
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    {backgroundColor: newTaskStatus === 'pending' ? getStatusStyle('pending').color : '#f7fafc'}
                  ]} 
                  onPress={() => setNewTaskStatus('pending')}
                >
                  <Text style={[
                    styles.statusOptionText, 
                    {color: newTaskStatus === 'pending' ? 'white' : '#4a5568'}
                  ]}>รอดำเนินการ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    {backgroundColor: newTaskStatus === 'in_progress' ? getStatusStyle('in_progress').color : '#f7fafc'}
                  ]} 
                  onPress={() => setNewTaskStatus('in_progress')}
                >
                  <Text style={[
                    styles.statusOptionText, 
                    {color: newTaskStatus === 'in_progress' ? 'white' : '#4a5568'}
                  ]}>กำลังทำ</Text>
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
