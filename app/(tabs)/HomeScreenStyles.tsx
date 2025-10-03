// app/(tabs)/HomeScreenStyles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe5ec",
    padding: 16,
  },
  header: {
    backgroundColor: "#fffafc",
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: "#ff8fab",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userText: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff8fab",
  },
  emailText: {
    fontSize: 14,
    color: "#a390b8",
    marginTop: 2,
  },
  loginTimeText: {
    fontSize: 12,
    color: "#b8a8c8",
    marginTop: 4,
  },
  content: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff8fab",
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: "#fffafc",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    shadowColor: "#ff8fab",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff8fab",
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    color: "#8b7a9e",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  setupButton: {
    backgroundColor: "#3b82f6",
  },
  logoutButton: {
    backgroundColor: "#ff0a54",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  debugInfo: {
    backgroundColor: "#f8e8f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  debugText: {
    fontSize: 12,
    color: "#a390b8",
    marginBottom: 4,
  },
});