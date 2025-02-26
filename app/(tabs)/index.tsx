import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  FlatList,
  View,
  StyleSheet,
  Text,
} from "react-native";
import CategoriesSlider from "@/components/CategoriesSlider";
import RecomendSection from "@/components/RecomendSection";
import SearchButton from "@/components/SearchButton";
import { useRouter } from "expo-router";

// Интерфейс для категории из базы данных
interface Category {
  _id: string;
  photo: string;
  title: string;
}

// Интерфейс для продукта (оставляем как есть)
interface Product {
  id: number;
  name: string;
  condition: string;
  price: string;
  city: string;
  date: string;
  img?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]); // Состояние для категорий
  const [loading, setLoading] = useState(true); // Состояние загрузки

  // Функция для получения категорий из базы данных
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/categories");  
      const data: Category[] = await response.json();
      
      setCategories(data);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем категории при монтировании компонента
  useEffect(() => {
    fetchCategories();
  }, []);

  // Секции для FlatList
  const sections = [
    {
      id: "slider",
      component: loading ? (
        <Text style={styles.loadingText}>Загрузка категорий...</Text>
      ) : (
        <CategoriesSlider data={categories} />
      ),
    },
    { id: "recomend", component: <RecomendSection data={products} /> },
  ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#151718",
        paddingTop: StatusBar.currentHeight || 20,
      }}
    >
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
    backgroundColor: "#151718",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    padding: 20,
  },
});

// Пример данных для продуктов (оставляем как есть)
const products: Product[] = [
  {
    id: 1,
    name: "Телефон",
    condition: "БУ",
    price: "50000",
    city: "Алматы",
    date: "05.02.2025",
    img: "https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg",
  },
  {
    id: 2,
    name: "Ноутбук",
    condition: "Новый",
    price: "300000",
    city: "Астана",
    date: "04.02.2025",
    img: "https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg",
  },
  {
    id: 3,
    name: "Велосипед",
    condition: "БУ",
    price: "75000",
    city: "Шымкент",
    date: "03.02.2025",
    img: "https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg",
  },
  {
    id: 4,
    name: "Камера",
    condition: "Новый",
    price: "150000",
    city: "Караганда",
    date: "02.02.2025",
    img: "https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg",
  },
  {
    id: 5,
    name: "Наушники",
    condition: "БУ",
    price: "20000",
    city: "Атырау",
    date: "01.02.2025",
    img: "https://doctor-veterinar.ru/media/k2/items/cache/675d28c04794e3c683f4419536c4c15f_XL.jpg",
  },
];