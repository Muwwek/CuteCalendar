// app/(tabs)/settings.tsx
import { useState } from "react";
import { View, Button, StyleSheet } from "react-native";

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState<{ title: string; time: string }[]>([]);

  const handleSave = (event: { title: string; time: string }) => {
    setEvents([...events, event]);
  };

  const handleDelete = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Button title="เพิ่มกิจกรรม" onPress={() => setModalVisible(true)} />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb", // เทียบเท่า bg-gray-50
  },
});
