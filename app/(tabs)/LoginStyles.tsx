//app/(tabs)/LoginStyles.tsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "100%",
    marginBottom: 8,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeButton: {
    padding: 4,
  },
  correctText: {
    color: "green",
    alignSelf: "flex-start",
    marginBottom: 16,
    fontSize: 14,
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 16,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  forgotPassword: {
    marginTop: 10,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  inputError: {
    borderColor: "red",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: "#007AFF",
  },
  testButton: {
    padding: 10,
    marginBottom: 16,
  },
  testButtonText: {
    color: "#FF9500",
    fontSize: 14,
    textAlign: "center",
  },
  debugInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    width: "100%",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});