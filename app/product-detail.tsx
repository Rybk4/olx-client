import React, { useState, useRef, useCallback } from 'react'; // Import useCallback
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
    Animated,
    StatusBar,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AntDesign from '@expo/vector-icons/AntDesign';
import ImageViewer from 'react-native-image-zoom-viewer';
import { createOrRedirectToChat } from '@/hooks/chatUtils'; // Import the chat utility
import { useAuthStore } from '@/store/authStore';

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
        creatorId,
    } = useLocalSearchParams();

    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    // Анимация для плавного появления фона
    const scrollY = useRef(new Animated.Value(0)).current;
    const backgroundOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Цвет фона с анимацией прозрачности
    const animatedBackgroundColor = backgroundOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(34, 34, 34, 0)', 'rgba(34, 34, 34, 1)'], // От прозрачного до #222
    });

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
    const renderPhotoItem = useCallback(
        (
            { item, index }: { item: string; index: number } // Use useCallback
        ) => (
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleImagePress(index)}>
                <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
        ),
        [handleImagePress]
    );

    // Кастомный заголовок с кнопкой закрытия (крестик)
    const renderHeader = useCallback(
        () => (
            // Use useCallback
            <SafeAreaView style={styles.headerContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
            </SafeAreaView>
        ),
        [setModalVisible]
    );

    const { user } = useAuthStore();

    const handleStartChat = async () => {
        const currentUserId = user?.id;
        console.log('product', id);
        console.log('creatorId', creatorId);
        const sellerId = Array.isArray(creatorId) ? creatorId[0] : creatorId; // Ensure sellerId is a string.
        const productId = id;
        if (!sellerId) {
            alert('Seller ID is missing. Cannot start chat.');
            return;
        }
        if (!productId) {
            alert('Product ID is missing. Cannot start chat.');
            return;
        }
        if (!currentUserId) {
            alert('You must be logged in to start a chat.');
            return;
        }

        if (currentUserId === sellerId) {
            alert("You can't message yourself!");
            return;
        }
        await createOrRedirectToChat(sellerId, productId as string);
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#222" barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={16}
                >
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
                                <Text style={styles.description}>{description}</Text>
                                <Text style={styles.description}>{description}</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Кнопка "Назад" с анимированным фоном */}
                <Animated.View style={[styles.header, { backgroundColor: animatedBackgroundColor }]}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <IconSymbol size={28} name="left.btn" color={'white'} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Фиксированный контейнер с кнопками внизу */}
                <View style={styles.fixedButtonContainer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.callButton}>
                            <Text style={styles.buttonText}>Позвонить / SMS</Text>
                        </TouchableOpacity>
                        {/*  The message button */}
                        <TouchableOpacity style={styles.messageButton} onPress={handleStartChat}>
                            <Text style={styles.buttonText}>Сообщение</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Модальное окно для просмотра изображений с зумом */}
            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <ImageViewer
                    imageUrls={images}
                    index={initialImageIndex}
                    onCancel={() => setModalVisible(false)}
                    enableSwipeDown
                    saveToLocalByLongPress={false}
                    backgroundColor="#222"
                    renderIndicator={(currentIndex, allSize) => (
                        <Text style={styles.imageIndicator}>
                            {currentIndex}/{allSize}
                        </Text>
                    )}
                    renderHeader={renderHeader}
                    style={styles.imageViewer}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#222',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        left: 0,
        zIndex: 10,
        padding: 10,
        width: '100%',
    },
    backButton: {
        padding: 5,
        marginTop: Platform.OS === 'android' ? 0 : 25,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    slider: {
        width: '100%',
        height: 250,
        marginBottom: 15,
        marginTop: 7,
    },
    image: {
        width: width,
        height: 250,
        borderRadius: 0,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#222',
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
        marginTop: -30,
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
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#222', // Фон для контейнера кнопок
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
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
