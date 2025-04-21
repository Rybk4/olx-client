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
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AntDesign from '@expo/vector-icons/AntDesign';
import ImageViewer from 'react-native-image-zoom-viewer';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = () => {
    const {
        id,
        title,
        category,
        description,
        dealType,
        price,
        isNegotiable,
        condition,
        sellerName,
        phone,
        createdAt,
        updatedAt,
        photos,
    } = useLocalSearchParams();

    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    // Разбираем массив photos из строки JSON
    const photoArray: string[] = photos ? JSON.parse(photos as string) : [];

    // Формируем массив изображений для ImageViewer
    const images = photoArray.map((uri) => ({ url: uri }));

    // Преобразуем строковые параметры в нужные типы
    const priceNumber = price ? parseFloat(price as string) : 0;
    const isNegotiableBool = isNegotiable === 'true';

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
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleImagePress(index)}>
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
    );

    // Кастомный заголовок с кнопкой закрытия (крестик)
    const renderHeader = () => (
        <SafeAreaView style={styles.headerContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <IconSymbol size={28} name="left.btn" color={'white'} />
                    </TouchableOpacity>
                </View>

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
                <View style={styles.content}>
                    <Text style={styles.date}>{createdAt}</Text>
                    <Text style={styles.name}>{title}</Text>
                    <Text style={styles.price}>{priceNumber} ₸</Text>

                    {/* Характеристики в две колонки */}
                    <View style={styles.characteristics}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Категория</Text>
                            <Text style={styles.labelsValue}>{category}</Text>
                            <Text style={styles.label}>Тип сделки</Text>
                            <Text style={styles.labelsValue}>{dealType}</Text>
                            <Text style={styles.label}>Состояние</Text>
                            <Text style={styles.labelsValue}>{condition}</Text>
                            <Text style={styles.label}>Телефон</Text>
                            <Text style={styles.labelsValue}>{phone || 'Не указан'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Возможен торг</Text>
                            <Text style={styles.labelsValue}>{isNegotiableBool ? 'Да' : 'Нет'}</Text>
                            <Text style={styles.label}>Продавец</Text>
                            <Text style={styles.labelsValue}>{sellerName}</Text>
                            <Text style={styles.label}>Дата обновления</Text>
                            <Text style={styles.labelsValue}>{updatedAt}</Text>
                        </View>
                    </View>

                    {/* Описание */}
                    {description && (
                        <View style={styles.descriptionSection}>
                            <Text style={styles.sectionTitle}>Описание</Text>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    )}

                    {/* Кнопки */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.callButton}>
                            <Text style={styles.buttonText}>Позвонить / SMS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.messageButton}>
                            <Text style={styles.buttonText}>Сообщение</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Модальное окно для просмотра изображений с зумом */}
                <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
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
        </ScrollView>
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
    scrollContent: {
       
    },
    slider: {
        width: '100%',
        height: 250,
        marginBottom: 15,
         
    },
    image: {
        width: width ,
        height: 250,
        borderRadius: 10,
    },
    content: {
        paddingHorizontal: 20,
    },
    date: {
        color: 'gray',
        fontSize: 14,
        marginBottom: 5,
    },
    name: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    price: {
        color: '#00ffcc',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    characteristics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    label: {
        color: 'gray',
        fontSize: 14,
        marginBottom: 5,
    },
    labelsValue: {
        color: 'white',
        fontSize: 14,
        marginBottom: 10,
    },
    descriptionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        color: 'white',
        fontSize: 14,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    callButton: {
        flex: 1,
        backgroundColor: '#333',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginRight: 10,
    },
    messageButton: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noImageText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },
    imageIndicator: {
        color: 'white',
        fontSize: 16,
        position: 'absolute',
        top: 30,
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
});

export default ProductDetailScreen;
