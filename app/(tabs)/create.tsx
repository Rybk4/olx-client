import React, { useState , useEffect } from "react";
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
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import RNPickerSelect from "react-native-picker-select";

import * as FileSystem from "expo-file-system";
import axios from "axios";

 
// Интерфейс для данных формы, соответствующий ProductSchema
interface ProductForm {
  photo?: string[]; // Массив строк для поддержки нескольких фото
  title: string;
  category: string;
  description?: string;
  dealType: string;
  price?: string; // Используем string для ввода цены
  isNegotiable: boolean;
  condition: string;
  address: string;
  sellerName: string;
  email?: string;
  phone?: string;
}

//
interface Category {
  id: number; // ID
  title: string; // name of the category
}


export default function TabThreeScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductForm>({
    photo: [],
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
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const handleInputChange = (field: keyof ProductForm, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://olx-server.makkenzo.com/categories"); // Adjust endpoint as needed
        const categoryList = response.data; // Assuming response.data is an array of category names
        setCategories(categoryList);
        setLoadingCategories(false);
        //console.log("Категории загружены:", categoryList);
      } catch (error) {
        console.error("Ошибка при загрузке категорий:", error);
        setMessage("Ошибка при загрузке категорий");
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDealTypeSelect = (dealType: string) => {
    setFormData((prev) => ({
      ...prev,
      dealType,
      price: dealType === "Продать" ? prev.price : "",
      isNegotiable: dealType === "Продать" ? prev.isNegotiable : false,
    }));
  };

  const handleConditionSelect = (condition: string) => {
    handleInputChange("condition", condition);
  };

  // Выбор фото из галереи
  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      handleInputChange("photo", [...(formData.photo || []), ...newPhotos]);
    }
  };

  // Съемка фото с камеры
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const newPhoto = result.assets[0].uri;
      handleInputChange("photo", [...(formData.photo || []), newPhoto]);
    }
  };

  // Обработчик нажатия на кнопку выбора фото
  const handlePhotoSelect = async () => {
    await pickImageFromGallery(); // По умолчанию галерея
    // await takePhoto(); // Раскомментируйте для камеры
  };

  // Удаление фото из списка
  const removePhoto = (uri: string) => {
    const updatedPhotos = (formData.photo || []).filter((photoUri) => photoUri !== uri);
    handleInputChange("photo", updatedPhotos);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.dealType || !formData.condition || !formData.address || !formData.sellerName) {
      setMessage("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const formDataToSend = new FormData();
    // Добавляем текстовые поля
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('dealType', formData.dealType);
    formDataToSend.append('price', formData.dealType === "Продать" && formData.price ? formData.price : '0');
    formDataToSend.append('isNegotiable', formData.dealType === "Продать" ? formData.isNegotiable.toString() : 'false');
    formDataToSend.append('condition', formData.condition);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('sellerName', formData.sellerName);
    formDataToSend.append('email', formData.email || '');
    formDataToSend.append('phone', formData.phone || '');

    // Добавляем файлы (изображения)
    if (formData.photo && formData.photo.length > 0) {
      for (let i = 0; i < formData.photo.length; i++) {
        const uri = formData.photo[i];
        const fileName = uri.split('/').pop() || `image${i}.jpg`;
        const fileType = uri.split('.').pop() || 'jpg';
        const fileUri = await FileSystem.getInfoAsync(uri);
        if (fileUri.exists) {
          const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          formDataToSend.append(`photo[${i}]`, {
            uri: uri,
            type: `image/${fileType}`,
            name: fileName,
          } as any);
        }
      }
    }

   // console.log("Отправка данных:", formDataToSend);
    try {
      const response = await axios.post("https://olx-server.makkenzo.com/products", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
      }

      const result = await response.data;
     // console.log("Товар добавлен:", result);
      setMessage("Товар успешно добавлен!");
      setFormData({
        photo: [],
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

  const isSellSelected = formData.dealType === "Продать";

  // Рендеринг мини-галереи выбранных фото
  const renderPhotoItem = ({ item }: { item: string }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item }} style={styles.photoPreview} />
      <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(item)}>
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Добавить объявление</Text>
        <Text style={styles.label}>Опишите в подробностях</Text>

        {/* Галерея и кнопка добавления фото */}
        {formData.photo && formData.photo.length > 0 && (
          <FlatList
            data={formData.photo}
            renderItem={renderPhotoItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            style={styles.photoGallery}
            contentContainerStyle={styles.photoGalleryContent}
          />
        )}
        <TouchableOpacity style={styles.photoButton} onPress={handlePhotoSelect}>
          <Text style={styles.photoButtonText}>Добавить фото</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Заголовок объявления</Text>
        <TextInput
          style={styles.input}
          placeholder="Например iPhone 12 Pro Max"
          placeholderTextColor="#888"
          value={formData.title}
          onChangeText={(text) => handleInputChange("title", text)}
        />
         
       {/* Category Dropdown */}
       <Text style={styles.label}>Выберите категорию</Text>
        {loadingCategories ? (
          <Text style={styles.loadingText}>Загрузка категорий...</Text>
        ) : (
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(itemValue) => handleInputChange("category", itemValue)}
              items={categories.map((category) => ({
                label: category.title,
                value: category.title,
                key: category.id,
              }))}
              placeholder={{
                label: "Выберите категорию",
                value: "",
                color: "blue",
                 
              }}
              style={{
                inputAndroid: styles.pickerInputAndroid,
                inputIOS: styles.pickerInputIOS,
                placeholder: styles.pickerPlaceholder,
                modalViewBottom: styles.pickerModal,
                modalViewMiddle: styles.pickerModal,
              }}
            />
          </View>
        )}


        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={styles.input}
          placeholder="Подумайте, какие подробности вы бы хотели узнать из объявления. И добавьте их сюда."
          placeholderTextColor="#888"
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          multiline
        />

        <Text style={styles.label}>Тип сделки</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.dealType === "Продать" && styles.selectedButton,
            ]}
            onPress={() => handleDealTypeSelect("Продать")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.dealType === "Продать" && styles.selectedText,
              ]}
            >
              Продать
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.dealType === "Обмен" && styles.selectedButton,
            ]}
            onPress={() => handleDealTypeSelect("Обмен")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.dealType === "Обмен" && styles.selectedText,
              ]}
            >
              Обмен
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.dealType === "Бесплатно" && styles.selectedButton,
            ]}
            onPress={() => handleDealTypeSelect("Бесплатно")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.dealType === "Бесплатно" && styles.selectedText,
              ]}
            >
              Бесплатно
            </Text>
          </TouchableOpacity>
        </View>

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

        <Text style={styles.label}>Состояние</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.condition === "Б/у" && styles.selectedButton,
            ]}
            onPress={() => handleConditionSelect("Б/у")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.condition === "Б/у" && styles.selectedText,
              ]}
            >
              Б/у
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dealTypeButton,
              formData.condition === "Новый" && styles.selectedButton,
            ]}
            onPress={() => handleConditionSelect("Новый")}
          >
            <Text
              style={[
                styles.dealTypeText,
                formData.condition === "Новый" && styles.selectedText,
              ]}
            >
              Новый
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Ваши контактные данные</Text>
        <TextInput
          style={styles.input}
          placeholder="Адрес *"
          placeholderTextColor="#888"
          value={formData.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />
        <Text style={styles.label}>Контактное лицо</Text>
        <TextInput
          style={styles.input}
          placeholder="Ваше имя"
          placeholderTextColor="#888"
          value={formData.sellerName}
          onChangeText={(text) => handleInputChange("sellerName", text)}
        />
        <Text style={styles.label}>Электронная почта</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={formData.email}
          onChangeText={(text) => handleInputChange("email", text)}
          keyboardType="email-address"
        />
        <Text style={styles.label}>Телефон</Text>
        <TextInput
          style={styles.input}
          placeholder="Телефон"
          placeholderTextColor="#888"
          value={formData.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Опубликовать</Text>
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
    textAlign: "center",
    marginVertical: 20,
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
    marginTop: 10,
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
  photoButton: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    width: "60%",
    alignSelf: "center",
  },
  photoButtonText: {
    color: "white",
    fontSize: 16,
  },
  photoGallery: {
    marginBottom: 15,
  },
  photoGalleryContent: {
    alignItems: "center",
  },
  photoContainer: {
    position: "relative",
    marginHorizontal: 5,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    color: "#888",
    fontSize: 16,
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerInputAndroid: {
    backgroundColor: "#333",
    color: "white",
    padding: 10,
    borderRadius: 8,
  },
  pickerInputIOS: {
    backgroundColor: "#333",
    color: "white",
    padding: 10,
    borderRadius: 8,
  },
  pickerPlaceholder: {
    color: "white",
  },
  pickerModal: {
    backgroundColor: "green", 
    borderRadius: 10,
    padding: 20,
    
  },
});