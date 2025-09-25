// app/(tabs)/settings.tsx
import { useState } from "react";
import { View, Text, Button, TextInput, ScrollView, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./SettingStyles";

type Task = {
  id: number;
  title: string;
  category: string;
  type: "ชั่วโมง" | "นาที";
  duration: number;
  date: Date;
  priority: number;
  deadline?: Date;
};

const categoryColors: Record<string, string> = {
  "งานเร่งด่วน": "#ef4444",
  "งานรอง": "#3b82f6",
  "พักผ่อน": "#10b981",
  "Event": "#f59e0b",
  "Personal": "#8b5cf6",
};

export default function SettingsScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("งานเร่งด่วน");
  const [duration, setDuration] = useState<number>(0);
  const [type, setType] = useState<"ชั่วโมง" | "นาที">("ชั่วโมง");
  const [date, setDate] = useState(new Date());
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const handleAddTask = () => {
    if (!title.trim() || duration <= 0) return; // ป้องกันค่าผิดพลาด

    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      category,
      duration,
      type,
      date,
      priority: category === "งานเร่งด่วน" ? 1 : category === "งานรอง" ? 2 : 3,
      deadline: category === "งานเร่งด่วน" ? deadline : undefined,
    };

    setTasks((prev) => [...prev, newTask].sort((a, b) => a.priority - b.priority));
    
    // รีเซ็ตฟอร์ม
    setTitle("");
    setDuration(0);
    setType("ชั่วโมง");
    setCategory("งานเร่งด่วน");
    setDate(new Date());
    setDeadline(new Date());
  };

  // แสดง Timeline งาน
  const renderTimeline = () => {
    if (tasks.length === 0) {
      return <Text style={styles.emptyState}>ยังไม่มีงานที่เพิ่มเข้ามา</Text>;
    }

    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const key = task.date.toDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });

    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((dateStr) => (
        <View key={dateStr} style={{ marginBottom: 20 }}>
          <Text style={styles.dateHeader}>
            {new Date(dateStr).toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          {grouped[dateStr].map((task) => (
            <View
              key={task.id}
              style={[styles.taskBlock, { backgroundColor: categoryColors[task.category] || "#6b7280" }]}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDetails}>
                📂 {task.category} • ⏱️ {task.duration} {task.type}
                {task.deadline && ` • 📅 เสร็จก่อน: ${task.deadline.toLocaleDateString('th-TH')}`}
              </Text>
            </View>
          ))}
        </View>
      ));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>✨ เพิ่มงานใหม่</Text>

      <View style={styles.formBlock}>
        {/* ชื่อกิจกรรม */}
        <Text style={styles.label}>📝 ชื่อกิจกรรม</Text>
        <TextInput
          style={styles.input}
          placeholder="พิมพ์ชื่อกิจกรรมที่ต้องทำ..."
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* หมวดหมู่ */}
        <Text style={styles.label}>📂 หมวดหมู่งาน</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(item) => setCategory(item)}
            style={{ height: 50, color: "#1f2937" }}
          >
            <Picker.Item label="🔥 งานเร่งด่วน" value="งานเร่งด่วน" />
            <Picker.Item label="📋 งานรอง" value="งานรอง" />
            <Picker.Item label="😌 พักผ่อน" value="พักผ่อน" />
            <Picker.Item label="🎉 Event" value="Event" />
            <Picker.Item label="👤 Personal" value="Personal" />
          </Picker>
        </View>

        {/* ระยะเวลา */}
        <Text style={styles.label}>⏱️ ระยะเวลาที่ใช้</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.durationInput}
            placeholder="0"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={duration > 0 ? duration.toString() : ""}
            onChangeText={(text) => setDuration(Number(text) || 0)}
          />
          <View style={styles.durationPickerContainer}>
            <Picker 
              selectedValue={type} 
              onValueChange={(item) => setType(item)} 
              style={{ height: 50, color: "#1f2937" }}
            >
              <Picker.Item label="ชั่วโมง" value="ชั่วโมง" />
              <Picker.Item label="นาที" value="นาที" />
            </Picker>
          </View>
        </View>

        {/* เลือกวันที่ */}
        <Text style={styles.label}>📅 กำหนดวันที่ทำ</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            📅 {date.toLocaleDateString('th-TH', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </TouchableOpacity>

        {/* Deadline สำหรับงานเร่งด่วน */}
        {category === "งานเร่งด่วน" && (
          <>
            <Text style={styles.label}>⚠️ กำหนดเสร็จภายใน</Text>
            <TouchableOpacity 
              style={styles.deadlineButton}
              onPress={() => setShowDeadlinePicker(true)}
            >
              <Text style={styles.deadlineButtonText}>
                ⏰ เสร็จก่อน: {deadline.toLocaleDateString('th-TH', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ปุ่มเพิ่มงาน */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTask}
          disabled={!title.trim() || duration <= 0}
        >
          <Text style={styles.addButtonText}>
            ➕ เพิ่มงานใหม่
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline Section */}
      <Text style={styles.heading}>📋 Timeline งาน</Text>
      <View style={styles.timelineBlock}>
        {renderTimeline()}
      </View>

      {/* Date Time Pickers */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(selectedDate) => {
          setDate(selectedDate);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        date={date}
      />

      <DateTimePickerModal
        isVisible={showDeadlinePicker}
        mode="date"
        onConfirm={(selectedDate) => {
          setDeadline(selectedDate);
          setShowDeadlinePicker(false);
        }}
        onCancel={() => setShowDeadlinePicker(false)}
        date={deadline}
        minimumDate={new Date()}
      />
    </ScrollView>
  );
}