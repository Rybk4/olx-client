import React from "react";
import { 
  Text, 
  StyleSheet, 
  View, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity 
} from "react-native";

const { width } = Dimensions.get("window");

interface SliderItem {
  id: number;
  name: string;
}

interface CategoriesSliderProps {
  data: SliderItem[];
}

const groupDataIntoPages = (data: SliderItem[], itemsPerPage: number) => {
  const pages = [];
  for (let i = 0; i < data.length; i += itemsPerPage) {
    pages.push(data.slice(i, i + itemsPerPage));
  }
  return pages;
};

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({ data }) => {
  const pages = groupDataIntoPages(data, 8);

  return (
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4d1100",
    marginTop:20,
    paddingTop:10,
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
    color: "#b8b8b2",
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

export default CategoriesSlider;
