import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import  CategoriesSlider  from '@/components/CategoriesSlider';

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

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black", paddingTop: StatusBar.currentHeight || 20 }}>
      <CategoriesSlider data={sliderData} />
    </SafeAreaView>
  );
}
