import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Modal,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AntDesign from '@expo/vector-icons/AntDesign';
import ImageViewer from 'react-native-image-zoom-viewer';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const { id, name, condition, price, city, date, photos } = useLocalSearchParams();
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    // Разбираем массив photos из строки JSON
    const photoArray: string[] = photos ? JSON.parse(photos as string) : [];

    // Формируем массив изображений для ImageViewer
    const images = photoArray.map((uri) => ({ url: uri }));

    const handleGoBack = () => {
        navigation.goBack();
    };

    // Обработчик нажатия на изображение
    const handleImagePress = (index: number) => {
        setInitialImageIndex(index);
        setModalVisible(true);
    };

    // Рендеринг элемента слайдера
    const renderPhotoItem = ({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleImagePress(index)}
        >
            <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    // Кастомный заголовок с кнопкой закрытия (крестик)
    const renderHeader = () => (
        <SafeAreaView style={styles.headerContainer}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
            >
                <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <IconSymbol size={28} name="left.btn" color={'white'} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                {photoArray.length > 0 ? (
                    <FlatList
                        data={photoArray}
                        renderItem={renderPhotoItem}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.slider}
                    />
                ) : (
                    <Text style={styles.noImageText}>Нет изображений</Text>
                )}
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.condition}>Состояние: {condition}</Text>
                <Text style={styles.price}>Цена: {price} ₸</Text>
                <Text style={styles.location}>
                    Город: {city}, Дата: {date}
                </Text>
            </View>
            {/* Модальное окно для просмотра изображений с зумом */}
            <Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <ImageViewer
                    imageUrls={images}
                    index={initialImageIndex}
                    onCancel={() => setModalVisible(false)}
                    enableSwipeDown
                    saveToLocalByLongPress={false}
                    backgroundColor="black"
                    renderIndicator={(currentIndex, allSize) => (
                        <Text style={styles.imageIndicator}>
                            {currentIndex}/{allSize}
                        </Text>
                    )}
                    renderHeader={renderHeader}
                    style={styles.imageViewer}
                />
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
    },
    header: {
        padding: 10,
        backgroundColor: '#333',
    },
    backButton: {
        padding: 0,
        marginTop: 25,
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    slider: {
        width: '100%',
        height: 250,
        marginBottom: 15,
    },
    image: {
        width: width - 40,
        height: 250,
        borderRadius: 10,
    },
    name: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    condition: {
        color: 'gray',
        fontSize: 16,
        marginBottom: 5,
    },
    price: {
        color: '#00ffcc',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    location: {
        color: 'white',
        fontSize: 14,
        marginBottom: 5,
    },
    noImageText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 15,
    },
    imageIndicator: {
        color: 'white',
        fontSize: 16,
        position: 'absolute',
        top: 30, // Смещаем ниже, чтобы не перекрывать крестик
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    imageViewer: {
       paddingTop: 5,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginTop: 25,
        marginRight: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 20,
         
    },
    closeButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ProductDetailScreen;