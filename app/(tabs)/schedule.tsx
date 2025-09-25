// app/(tabs)/schedule.tsx
import { View, Text, SectionList, TextInput } from "react-native";
import { useState } from "react";
import { styles } from "./ScheduleStyles";

export default function ScheduleScreen() {
  const [search, setSearch] = useState("");

  const yearData = generateYearData(2025);

  // mock event ใส่บางวัน
  yearData[0].data.push({
    id: 1,
    title: "New Year Party",
    time: "00:00 - 02:00",
    by: "Admin",
    type: "Event",
  });

  yearData[185].data.push({
    id: 2,
    title: "Midterm Exam",
    time: "09:00",
    by: "ครู B",
    type: "Work",
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ตารางกิจกรรม ปี 2025</Text>
        <View style={styles.titleUnderline} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหากิจกรรม..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.searchIcon}>
          <Text>🔍</Text>
        </View>
      </View>

      <SectionList
        sections={yearData}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text
                style={[
                  styles.tag,
                  item.type === "Work" ? styles.workTag :
                  item.type === "งานเร่งด่วน" ? styles.urgentTag :
                  item.type === "งานรอง" ? styles.secondaryTag :
                  item.type === "พักผ่อน" ? styles.restTag :
                  item.type === "Event" ? styles.eventTag :
                  styles.personalTag,
                ]}
              >
                {item.type}
              </Text>
            </View>
            <Text style={styles.time}>🕒 {item.time}</Text>
            <Text style={styles.by}>by: {item.by}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ฟังก์ชันสร้างวันทั้งปี
function generateYearData(year: number) {
  const sections: { title: string; data: any[] }[] = [];
  const start = new Date(year, 0, 1); // 1 ม.ค.
  const end = new Date(year, 11, 31); // 31 ธ.ค.

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    sections.push({
      title: dateStr,
      data: [], // ยังว่าง หรือจะ preload event ก็ได้
    });
  }

  return sections;
}