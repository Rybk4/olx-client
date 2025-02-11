import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Dimensions,
  Image
} from "react-native";

const { width } = Dimensions.get("window");

interface Product {
  id: number;
  name: string;
  condition: string;
  price: string;
  city: string;
  date: string;
  category?: string;
  img: string;
}

interface Props {
  data: Product[];
  query?:string;
}

const RecomendSection: React.FC<Props> = ({ data, query }) => {


  const filteredData = query
    ? data.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : data;

  const renderItem = ({ item }: { item: Product }) => {
     
    return(

    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
      <Image 
        source={{ uri: 'data:image/webp;base64,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' }}
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
    </View>
  );}

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
