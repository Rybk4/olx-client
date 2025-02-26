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
  photo: string; // Поле опциональное, как в базе
  title: string;
}

// Новый интерфейс для продукта, соответствующий ProductSchema
interface Product {
  _id: string;
  photo: string;
  title: string;
  category: string;
  description?: string;
  dealType: string;
  price: number;
  isNegotiable: boolean;
  condition: string;
  address: string;
  sellerName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // Состояние для продуктов
  const [loading, setLoading] = useState(true); // Состояние загрузки

  // Функция для получения категорий из базы данных
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://olx-server.makkenzo.com/categories");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
    }
  };

  // Функция для получения продуктов из базы данных
  const fetchProducts = async () => {
    try {
      const response = await fetch("https://olx-server.makkenzo.com/products");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Ошибка при загрузке продуктов:", error);
    }
  };

  // Загружаем категории и продукты при монтировании компонента
  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()])
      .then(() => setLoading(false))
      .catch((error) => {
        console.error("Ошибка при загрузке данных:", error);
        setLoading(false);
      });
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
    {
      id: "recomend",
      component: loading ? (
        <Text style={styles.loadingText}>Загрузка продуктов...</Text>
      ) : (
        <RecomendSection data={products.reverse()} />
      ),
    },
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