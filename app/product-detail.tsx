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
import { useProductDetailStyles } from '@/styles/ProductDetailScreen';
import { useAuthStore } from '@/store/authStore';
import { useThemeContext } from '@/context/ThemeContext';

const ProductDetailScreen = () => {
    const { colors } = useThemeContext();
    const styles = useProductDetailStyles();
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
        outputRange: ['rgba(34, 34, 34, 0)', colors.secondary], // От прозрачного до #222
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
                    <AntDesign name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </SafeAreaView>
        ),
        [setModalVisible]
    );

    const { user } = useAuthStore();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.secondary} barStyle="dark-content" />
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
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Кнопка "Назад" с анимированным фоном */}
                <Animated.View style={[styles.header, { backgroundColor: animatedBackgroundColor }]}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <IconSymbol size={28} name="left.btn" color={colors.primary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Фиксированный контейнер с кнопками внизу */}
                <View style={styles.fixedButtonContainer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.callButton}>
                            <Text style={styles.buttonText}>Позвонить / SMS</Text>
                        </TouchableOpacity>
                        {/*  The message button */}
                        <TouchableOpacity style={styles.messageButton}>
                            <Text style={styles.buttonText1}>Сообщение</Text>
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
                    backgroundColor={colors.background}
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

export default ProductDetailScreen;
