import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import RecomendSection from "@/components/RecomendSection";

export default function SearchScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    console.log("Поиск:", text); // Вывод в консоль
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Введите текст..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={handleSearchChange} // Функция обработки ввода
          autoFocus
        />
      </View>
      <RecomendSection data={products} query={searchQuery} />
    </SafeAreaView>
  );
}

const products = [
    { id: 1, name: "Телефон", condition: "БУ", price: "50000", city: "Алматы", date: "05.02.2025" },
    { id: 2, name: "Ноутбук", condition: "Новый", price: "300000", city: "Астана", date: "04.02.2025" },
    { id: 3, name: "Велосипед", condition: "БУ", price: "75000", city: "Шымкент", date: "03.02.2025" },
    { id: 4, name: "Камера", condition: "Новый", price: "150000", city: "Караганда", date: "02.02.2025" },
    { id: 5, name: "Наушники", condition: "БУ", price: "20000", city: "Атырау", date: "01.02.2025" },
    { id: 4, name: "Камера", condition: "Новый", price: "150000", city: "Караганда", date: "02.02.2025" },
    { id: 5, name: "Наушники", condition: "БУ", price: "20000", city: "Атырау", date: "01.02.2025" }
];


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "black" 
},
  searchContainer: { 
    flexDirection: "row",
    alignItems: "center",
    padding: 10, 
    backgroundColor: "#222",
    paddingTop:30
},
  backButton: { 
    padding: 10,
    marginRight: 10 
},
  backText: { 
    color: "white",
    fontSize: 20 
},
  searchBar: {
    flex: 1,
    height: 40, 
    color: "white",
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 10 
},
});
