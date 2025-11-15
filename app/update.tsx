import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
// Import hàm update mới
import { updateMovieDB } from '@/db/db'; 
import { Movie } from '@/component/Movie'; // Import Movie type
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdateMovieScreen() {
    const params = useLocalSearchParams();
    
    // Parse dữ liệu item từ params
    const movie: Movie = params.item ? JSON.parse(params.item as string) : null;

    const [title, setTitle] = useState(movie?.title || '');
    const [year, setYear] = useState(movie?.year ? movie.year.toString() : '');
    const [rating, setRating] = useState(movie?.rating ? movie.rating.toString() : '');
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (!movie) {
            Alert.alert("Lỗi", "Không tìm thấy dữ liệu phim để chỉnh sửa.");
            router.back();
        }
    }, [movie]);


    const handleSave = async () => {
        if (!movie) return;
        setError('');

        // 1. Validation: Title không rỗng
        if (!title.trim()) {
            setError('Tên phim (Title) không được để trống.');
            return;
        }

        // 2. Validation: Year
        const parsedYear = year ? parseInt(year, 10) : null;
        if (parsedYear !== null) {
            if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > currentYear) {
                setError(`Năm phát hành phải là số hợp lệ, từ 1900 đến ${currentYear}.`);
                return;
            }
        }

        // 3. Validation: Rating
        const parsedRating = rating ? parseInt(rating, 10) : null;
        if (parsedRating !== null) {
            if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                setError('Đánh giá (Rating) phải là số từ 1 đến 5.');
                return;
            }
        }
        
        try {
            await updateMovieDB(
                movie.id, // Dùng ID để cập nhật
                title.trim(),
                parsedYear,
                parsedRating
            );
            
            Alert.alert("Thành công", "Đã cập nhật thông tin phim!");
            
            // Đóng modal và quay lại màn hình chính
            router.back(); 

        } catch (err) {
            console.error("Lỗi UPDATE DB:", err);
            setError('Lỗi khi cập nhật dữ liệu vào cơ sở dữ liệu.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Chỉnh Sửa Phim</Text>

                {error ? <Text style={styles.errorText}>🛑 {error}</Text> : null}

                {/* Title Input */}
                <Text style={styles.label}>Tên Phim (Title)*</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Year Input */}
                <Text style={styles.label}>Năm Phát Hành (Year)</Text>
                <TextInput
                    style={styles.input}
                    value={year}
                    onChangeText={setYear}
                    keyboardType="numeric"
                />
                
                {/* Rating Input */}
                <Text style={styles.label}>Đánh Giá (Rating 1-5)</Text>
                <TextInput
                    style={styles.input}
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="numeric"
                    maxLength={1}
                />

                <View style={styles.buttonContainer}>
                    <Button title="Lưu Thay Đổi" onPress={handleSave} />
                    <Button title="Hủy" onPress={() => router.back()} color="#aaa" />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' },
    container: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 15,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});