import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// Интерфейс для продукта, оптимизированный под ProductSchema с массивом фото
interface Product {
  _id: string;          // Уникальный идентификатор из MongoDB
  title: string;        // Название (вместо name)
  condition: string;    // Состояние
  price: number;        // Цена (число, как в схеме)
  address: string;      // Адрес (вместо city)
  createdAt?: string;    // Дата создания (вместо date)
  photo?: string[];     // Массив ссылок на фото, опционально
}

interface Props {
  data: Product[];
  query?: string;
}

const RecomendSection: React.FC<Props> = ({ data, query }) => {
  const router = useRouter();

  // Фильтрация данных по запросу
  const filteredData = query
    ? data.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    : data;

  // Обработчик нажатия на продукт
  const handleProductPress = (item: Product) => {
    router.push({
      pathname: "/product-detail",
      params: {
        id: item._id,
        name: item.title,           // Передаем title как name для совместимости
        condition: item.condition,
        price: item.price.toString(), // Преобразуем number в string
        city: item.address,         // Используем address как city
        date: item.createdAt,       // Используем createdAt как date
        photos: JSON.stringify(item.photo || []), // Передаем весь массив photo как JSON-строку
      },
    });
  };

  // Рендеринг элемента списка
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.imagePlaceholder}>
        
        {item.photo && item.photo.length > 0 ? (
          <Image
            source={{ uri: item.photo[0] }} // Отображаем только первое фото
            style={styles.imageStyle}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.noImageText}>Нет изображения</Text>
        )}
      </View>
      <Text style={styles.name}>{item.title}</Text>
      <Text style={styles.condition}>{item.condition}</Text>
      <Text style={styles.price}>{item.price} ₸</Text>
      <Text style={styles.location}>
        {item.address}, {item.createdAt}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Новые объявления</Text>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id} // Используем _id как ключ
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
    paddingLeft: 6,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: width / 2 - 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  imageStyle: {
    height: "100%",
    width: "100%",
    borderRadius: 6,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  condition: {
    color: "gray",
    fontSize: 14,
    marginTop: 2,
  },
  price: {
    color: "#00ffcc",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  location: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
  noImageText: {
    color: "white",
    fontSize: 14,
  },
});

export default RecomendSection;