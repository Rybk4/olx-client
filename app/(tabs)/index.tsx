import React, { useState } from "react";
import { SafeAreaView, StatusBar, FlatList,View,StyleSheet,TextInput } from "react-native";
import CategoriesSlider from "@/components/CategoriesSlider";
import RecomendSection from "@/components/RecomendSection";
import SearchButton from "@/components/SearchButton";
 
import { useRouter } from "expo-router";

export default function HomeScreen() {

  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#151718", paddingTop: StatusBar.currentHeight || 20 }}>

      <View style={styles.searchContainer}>
        <SearchButton onPress={() => router.push("/search")} />
      </View> 
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.component}  
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    alignItems: "center",
    marginVertical: 15,
    backgroundColor:'#151718',  
  },
});


//массивы для примера, позже будут запросы к бд
const sliderData = [
  { id: 1, name: "Элемент 1" },
  { id: 2, name: "Элемент 2" },
  { id: 3, name: "Элемент 3" },
  { id: 4, name: "Элемент 4" },
  { id: 5, name: "Элемент 5" },
  { id: 6, name: "Элемент 6" },
  { id: 7, name: "Элемент 7" },
  { id: 8, name: "Элемент 8" },
  { id: 9, name: "Элемент 9" },
  { id: 10, name: "Элемент 10" },
  { id: 11, name: "Элемент 11" },
  { id: 12, name: "Элемент 12" },
  { id: 13, name: "Элемент 13" },
  { id: 14, name: "Элемент 14" },
  { id: 15, name: "Элемент 15" }
];



const products = [
  { id: 1, name: "Телефон", condition: "БУ", price: "50000", city: "Алматы", date: "05.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
  { id: 2, name: "Ноутбук", condition: "Новый", price: "300000", city: "Астана", date: "04.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
  { id: 3, name: "Велосипед", condition: "БУ", price: "75000", city: "Шымкент", date: "03.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" },
  { id: 4, name: "Камера", condition: "Новый", price: "150000", city: "Караганда", date: "02.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg"},
  { id: 5, name: "Наушники", condition: "БУ", price: "20000", city: "Атырау", date: "01.02.2025", img:"https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg" }
];

const sections = [
  { id: "slider", component: <CategoriesSlider data={sliderData} /> },
  { id: "recomend", component: <RecomendSection data={products} /> }
];
