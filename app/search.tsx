import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import RecomendSection from "@/components/RecomendSection";
import { IconSymbol } from '@/components/ui/IconSymbol';

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
          <IconSymbol size={28} name="left.btn" color={"white"} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Что ищете?"
          placeholderTextColor="white"
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoFocus
        />
      </View>
      <RecomendSection data={products} query={searchQuery} />
    </SafeAreaView>
  );
}

const products = [
  { id: 1, name: "Телефон", condition: "БУ", price: "50000", city: "Алматы", date: "05.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg"  },
  { id: 2, name: "Ноутбук", condition: "Новый", price: "300000", city: "Астана", date: "04.02.2025" , img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
  { id: 3, name: "Велосипед", condition: "БУ", price: "75000", city: "Шымкент", date: "03.02.2025" , img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
  { id: 4, name: "Камера", condition: "Новый", price: "150000", city: "Караганда", date: "02.02.2025" , img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
  { id: 5, name: "Наушники", condition: "БУ", price: "20000", city: "Атырау", date: "01.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg"  },
  { id: 4, name: "Камера", condition: "Новый", price: "150000", city: "Караганда", date: "02.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg"  },
  { id: 5, name: "Наушники", condition: "БУ", price: "20000", city: "Атырау", date: "01.02.2025" , img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
      
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor:'#151718', 
    paddingTop: 35, 
     
   
  },
  backButton: {
    padding: 10,  
    backgroundColor: "#222", 
    borderTopLeftRadius: 8,   
    borderBottomLeftRadius: 8,  
    height: 50,
    textAlign: "center",
    alignItems: "center",
  },
  backText: {
    color: "white",
    
  },
  searchBar: {
    flex: 1,  
    height: 50,
    color: "white",
    backgroundColor: "#222", 
    borderTopRightRadius: 8, 
    borderBottomRightRadius: 8,  
    paddingHorizontal: 8,
    
    
  },
});