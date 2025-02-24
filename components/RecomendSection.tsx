import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router"; // Импортируем useRouter для навигации

const { width } = Dimensions.get("window");

interface Product {
  id: number;
  name: string;
  condition: string;
  price: string;
  city: string;
  date: string;
  category?: string;
  img?: string;
}

interface Props {
  data: Product[];
  query?: string;
}

const RecomendSection: React.FC<Props> = ({ data, query }) => {
  const router = useRouter(); // Получаем роутер для навигации

  const filteredData = query
    ? data.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : data;

  const handleProductPress = (item: Product) => {
    // Переходим на экран деталей товара, передавая данные через query
    router.push({
      pathname: "/product-detail", // Путь к экрану деталей (нужно создать)
      params: {
        id: item.id.toString(),
        name: item.name,
        condition: item.condition,
        price: item.price,
        city: item.city,
        date: item.date,
        img: item.img || "", // Передаем изображение, если оно есть
      },
    });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleProductPress(item)} // Обработчик нажатия
    >
      <View style={styles.imagePlaceholder}>
        <Image 
          source={require('../images/img7.jpg')} 
          style={styles.imageStyle} 
          resizeMode="cover" 
        />
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.condition}>{item.condition}</Text>
      <Text style={styles.price}>{item.price} ₸</Text>
      <Text style={styles.location}>
        {item.city}, {item.date}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Новые объявления</Text>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={true}
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
    paddingLeft: 6
  },
  listContainer: {
    paddingBottom: 20
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
    borderRadius: 6
  },
  imageStyle: {
    height: "100%",
    width: "100%",
    borderRadius: 6
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5
  },
  condition: {
    color: "gray",
    fontSize: 14,
    marginTop: 2
  },
  price: {
    color: "#00ffcc",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5
  },
  location: {
    color: "white",
    fontSize: 12,
    marginTop: 5
  }
});

export default RecomendSection;