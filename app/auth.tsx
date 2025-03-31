import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "./_layout"; // Импортируем контекст, который создадим позже
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const { setIsAuthSkipped } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Состояние для форм
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");

  const skipAuth = async () => {
    await AsyncStorage.setItem("authSkipped", "true");
    setIsAuthSkipped(true);
    router.replace("/(tabs)");
  };

  const closeScreen = () => {
    router.replace("/(tabs)");
  };

  const handleLogin = () => {
    // Логика входа (например, запрос к API)
    console.log("Вход:", { email: loginEmail, password: loginPassword });
    setIsAuthSkipped(true);
    router.replace("/(tabs)");
  };

  const handleRegister = () => {
    // Логика регистрации (например, запрос к API)
    console.log("Регистрация:", { name: registerName, email: registerEmail, password: registerPassword });
    setIsAuthSkipped(true);
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      {/* Крестик для закрытия */}
      <TouchableOpacity style={styles.closeButton} onPress={closeScreen}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Заголовок */}
      <Text style={styles.title}>Добро пожаловать в приложение!</Text>

      {/* Табы */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "login" && styles.activeTab]}
          onPress={() => setActiveTab("login")}
        >
          <Text style={[styles.tabText, activeTab === "login" && styles.activeTabText]}>Вход</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "register" && styles.activeTab]}
          onPress={() => setActiveTab("register")}
        >
          <Text style={[styles.tabText, activeTab === "register" && styles.activeTabText]}>Регистрация</Text>
        </TouchableOpacity>
      </View>

      {/* Форма входа или регистрации */}
      {activeTab === "login" ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={loginEmail}
            onChangeText={setLoginEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
          />
          <Button title="Войти" onPress={handleLogin} />
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Имя"
            value={registerName}
            onChangeText={setRegisterName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={registerEmail}
            onChangeText={setRegisterEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={registerPassword}
            onChangeText={setRegisterPassword}
            secureTextEntry
          />
          <Button title="Зарегистрироваться" onPress={handleRegister} />
        </View>
      )}

      {/* Кнопка "Пропустить" */}
      <TouchableOpacity onPress={skipAuth}>
        <Text style={styles.skipText}>Пропустить</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  closeText: {
    fontSize: 24,
    color: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  skipText: {
    textAlign: "center",
    color: "#007AFF",
    marginTop: 10,
    fontSize: 16,
  },
});