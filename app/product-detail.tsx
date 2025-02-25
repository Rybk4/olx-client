import React from "react";
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";  
import { IconSymbol } from '@/components/ui/IconSymbol';

const ProductDetailScreen = () => {
  const { id, name, condition, price, city, date, img } = useLocalSearchParams();
  const navigation = useNavigation();  

   
  const handleGoBack = () => {
    navigation.goBack();  
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <IconSymbol size={28} name="left.btn" color={"white"} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Image 
          source={ {uri: img.toString()} } 
          style={styles.image} 
          resizeMode="cover"
        />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.condition}>Состояние: {condition}</Text>
        <Text style={styles.price}>Цена: {price} ₸</Text>
        <Text style={styles.location}>Город: {city}, Дата: {date}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
  },
  header: {
    padding: 10,
    backgroundColor: "#333",
  },
  backButton: {
    padding: 0,
    marginTop: 25,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  condition: {
    color: "gray",
    fontSize: 16,
    marginBottom: 5,
  },
  price: {
    color: "#00ffcc",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  location: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
});

export default ProductDetailScreen;