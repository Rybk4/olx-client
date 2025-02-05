import React from "react";
import { 
  Text, 
  StyleSheet, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Dimensions,
  TouchableOpacity, 
  StatusBar 
} from "react-native";

const { width } = Dimensions.get("window");

interface SliderItem {
  id: number;
  name: string;
}

const sliderData: SliderItem[] = [
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

// Функция для группировки данных по страницам  
const groupDataIntoPages = (data: SliderItem[], itemsPerPage: number) => {
  const pages = [];
  for (let i = 0; i < data.length; i += itemsPerPage) {
    pages.push(data.slice(i, i + itemsPerPage));
  }
  return pages;
};

export default function HomeScreen() {
 
  const pages = groupDataIntoPages(sliderData, 8);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderTitle}>Категории</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Смотреть все</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          {pages.map((page, pageIndex) => (
            <View key={pageIndex} style={[styles.pageContainer, { width }]}>
              {page.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <View style={styles.item}>
                    <Text style={styles.itemText}>{item.id}</Text>
                  </View>
                  <Text style={styles.itemLabel}>{item.name}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black"
  },
  container: {
    paddingTop: StatusBar.currentHeight || 20,
    backgroundColor: "black"
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10
  },
  sliderTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },
  viewAll: {
    color: "gray",
    fontSize: 16
  },
  scrollContent: {
    flexDirection: "row"
  },
  pageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10
  },
  itemContainer: {
    width: "25%",  
    alignItems: "center",
    marginVertical: 10
  },
  item: {
    width: 70,
    height: 70,
    backgroundColor: "#333",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5
  },
  itemText: {
    color: "white",
    fontSize: 18
  },
  itemLabel: {
    color: "white",
    fontSize: 12,
    textAlign: "center"
  }
});
