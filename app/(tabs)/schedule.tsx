// app/(tabs)/schedule.tsx
import { View, Text, SectionList, TextInput } from "react-native"; // ✅ เพิ่ม TextInput
import { useState } from "react"; // ✅ สำหรับ state search
import { styles } from "./ScheduleStyles";

export default function ScheduleScreen() {
  const [search, setSearch] = useState(""); // ✅ เพิ่ม state สำหรับ search

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
      <Text style={styles.title}>ตารางกิจกรรม ปี 2025</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหากิจกรรม..."
        value={search}
        onChangeText={setSearch}
      />

      <Text>--------------------------------</Text>

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
                  item.type === "Work"
                    ? styles.workTag
                    : item.type === "Event"
                    ? styles.eventTag
                    : styles.personalTag,
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
          <Text style={styles.sectionHeader}>{title}</Text>
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
