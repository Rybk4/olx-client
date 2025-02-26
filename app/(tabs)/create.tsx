import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";

// Интерфейс для данных формы, соответствующий ProductSchema
interface ProductForm {
  photo?: string;
  title: string;
  category: string;
  description?: string;
  dealType: string;
  price?: string; // Используем string для ввода, преобразуем в number при отправке
  isNegotiable: boolean;
  condition: string;
  address: string;
  sellerName: string;
  email?: string;
  phone?: string;
}

export default function TabThreeScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductForm>({
    photo: "",
    title: "",
    category: "",
    description: "",
    dealType: "",
    price: "",
    isNegotiable: false,
    condition: "",
    address: "",
    sellerName: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState<string>("");

  const handleInputChange = (field: keyof ProductForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDealTypeSelect = (dealType: string) => {
    setFormData((prev) => ({
      ...prev,
      dealType,
      // Сбрасываем price и isNegotiable, если не "продать"
      price: dealType === "продать" ? prev.price : "",
      isNegotiable: dealType === "продать" ? prev.isNegotiable : false,
    }));
  };

  const handleSubmit = async () => {
    // Проверка обязательных полей
    if (!formData.title || !formData.category || !formData.dealType || !formData.condition || !formData.address || !formData.sellerName) {
      setMessage("Пожалуйста, заполните все обязательные поля");
      return;
    }

    // Преобразуем данные для отправки
    const dataToSend = {
      ...formData,
      price: formData.dealType === "продать" && formData.price ? parseFloat(formData.price) : 0, // 0, если не "продать"
      isNegotiable: formData.dealType === "продать" ? formData.isNegotiable : false, // false, если не "продать"
    };

    try {
      const response = await fetch("https://olx-server.makkenzo.com/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
      }

      const result = await response.json();
      console.log("Товар добавлен:", result);
      setMessage("Товар успешно добавлен!");
      setFormData({
        photo: "",
        title: "",
        category: "",
        description: "",
        dealType: "",
        price: "",
        isNegotiable: false,
        condition: "",
        address: "",
        sellerName: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Ошибка при добавлении товара:", error);
      setMessage("Ошибка при добавлении товара");
    }
  };

  const isSellSelected = formData.dealType === "продать";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Добавить товар</Text>

        <TextInput
          style={styles.input}
          placeholder="Ссылка на фото"
          placeholderTextColor="#888"
          value={formData.photo}
          onChangeText={(text) => handleInputChange("photo", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Заголовок *"
          placeholderTextColor="#888"
          value={formData.title}
          onChangeText={(text) => handleInputChange("title", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Категория *"
          placeholderTextColor="#888"
          value={formData.category}
          onChangeText={(text) => handleInputChange("category", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Описание"
          placeholderTextColor="#888"
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          multiline
        />

        {/* Кнопки для dealType */}
        <Text style={styles.label}>Тип сделки *</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.dealType === "продать" && styles.selectedButton,
            ]}
            onPress={() => handleDealTypeSelect("продать")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.dealType === "продать" && styles.selectedText,
              ]}
            >
              Продать
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.dealType === "обмен" && styles.selectedButton,
            ]}
            onPress={() => handleDealTypeSelect("обмен")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.dealType === "обмен" && styles.selectedText,
              ]}
            >
              Обмен
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.dealType === "бесплатно" && styles.selectedButton,
            ]}
            onPress={() => handleDealTypeSelect("бесплатно")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.dealType === "бесплатно" && styles.selectedText,
              ]}
            >
              Бесплатно
            </Text>
          </TouchableOpacity>
        </View>

        {/* Условное отображение полей "Цена" и "Возможен торг" */}
        {isSellSelected && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Цена"
              placeholderTextColor="#888"
              value={formData.price}
              onChangeText={(text) => handleInputChange("price", text)}
              keyboardType="numeric"
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Возможен торг</Text>
              <Switch
                value={formData.isNegotiable}
                onValueChange={(value) => handleInputChange("isNegotiable", value)}
                trackColor={{ false: "#767577", true: "#00ffcc" }}
                thumbColor={formData.isNegotiable ? "#fff" : "#f4f3f4"}
              />
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Состояние *"
          placeholderTextColor="#888"
          value={formData.condition}
          onChangeText={(text) => handleInputChange("condition", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Адрес *"
          placeholderTextColor="#888"
          value={formData.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Имя продавца *"
          placeholderTextColor="#888"
          value={formData.sellerName}
          onChangeText={(text) => handleInputChange("sellerName", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={formData.email}
          onChangeText={(text) => handleInputChange("email", text)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Телефон"
          placeholderTextColor="#888"
          value={formData.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Добавить товар</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151718",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dealTypeButton: {
    flex: 1,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: "#00ffcc",
  },
  dealTypeText: {
    color: "white",
    fontSize: 16,
  },
  selectedText: {
    color: "#151718",
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  switchLabel: {
    color: "white",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#00ffcc",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#151718",
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});