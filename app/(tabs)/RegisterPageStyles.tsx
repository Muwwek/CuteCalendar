//app/(tabs)/RegisterPageStyles.tsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 24 
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#007AFF",
    marginLeft: 5,
    fontSize: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 24 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    padding: 12, 
    borderRadius: 8, 
    width: "100%", 
    marginBottom: 12 
  },
  passwordContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    width: "100%", 
    marginBottom: 12, 
    paddingRight: 10 
  },
  passwordInput: { 
    flex: 1, 
    padding: 12 
  },
  eyeButton: { 
    padding: 4 
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
  },
  loginLink: {
    marginTop: 10,
  },
  loginLinkText: {
    color: "#007AFF",
    fontSize: 16,
  },
    resetButton: {
    marginBottom: 10,
    padding: 10,
  },
  resetButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
});