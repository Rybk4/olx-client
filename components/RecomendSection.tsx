import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions
} from "react-native";

const { width } = Dimensions.get("window");

interface Product {
  id: number;
  name: string;
  condition: string;
  price: string;
  city: string;
  date: string;
}

interface Props {
  data: Product[];
}

const RecomendSection: React.FC<Props> = ({ data }) => {
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>{item.id}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.condition}>{item.condition}</Text>
      <Text style={styles.price}>{item.price} ₸</Text>
      <Text style={styles.location}>
        {item.city}, {item.date}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Новые объявления</Text>
      <FlatList
        data={data}
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
  imageText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold"
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
