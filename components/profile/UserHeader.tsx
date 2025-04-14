import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

interface UserHeaderProps {
    username: string;
    userPhoto?: string; // URL или URI фото пользователя, опционально
}

export const UserHeader: React.FC<UserHeaderProps> = ({ username, userPhoto }) => {
    return (
        <View style={styles.header}>
            <View style={styles.userContainer}>
                {userPhoto ? (
                    <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
                ) : (
                    <View style={styles.placeholderPhoto}>
                        <Text style={styles.placeholderText}> </Text>
                    </View>
                )}
                <Text style={styles.headerText}>Привет, {username}!</Text>
            </View>
            <Text style={styles.subHeaderText}>Рады видеть вас снова!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginTop: 50,
        padding: 20,
        paddingTop: 20,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    userPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    placeholderPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    placeholderText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subHeaderText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        paddingTop: 10,
    },
});
