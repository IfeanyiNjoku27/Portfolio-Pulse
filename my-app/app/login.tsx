import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "../utils/firebaseConfig";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    try {
      // Authenticate with firebase
      await signInWithEmailAndPassword(auth, email, password);

      // Upon success route user to dashboard
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={styles.placeholderTextColor.color}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={styles.placeholderTextColor.color}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#FFFFFF"
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  placeholderTextColor: {
    color: "#FFFFFF"
  },
  button: {
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  linkText: {
    color: "#0A84FF",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
