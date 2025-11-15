import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
// Import hàm insert mới
import { insertMovieDB } from '@/db/db'; 

export default function AddMovieScreen() {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [rating, setRating] = useState('');
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();

    const handleSave = async () => {
        setError('');

        // 1. Validation: Title không rỗng
        if (!title.trim()) {
            setError('Tên phim (Title) không được để trống.');
            return;
        }

        // 2. Validation: Year (Nếu có nhập)
        const parsedYear = year ? parseInt(year, 10) : null;
        if (parsedYear !== null) {
            if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > currentYear) {
                setError(`Năm phát hành phải là số hợp lệ, từ 1900 đến ${currentYear}.`);
                return;
            }
        }

        // 3. Validation: Rating (Nếu có nhập)
        const parsedRating = rating ? parseInt(rating, 10) : null;
        if (parsedRating !== null) {
            if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                setError('Đánh giá (Rating) phải là số từ 1 đến 5.');
                return;
            }
        }
        
        try {
            await insertMovieDB(
                title.trim(),
                parsedYear,
                parsedRating
            );
            
            Alert.alert("Thành công", "Đã thêm phim mới vào danh sách!");
            
            // Đóng modal và quay lại màn hình chính
            router.back(); 

        } catch (err) {
            console.error("Lỗi INSERT DB:", err);
            setError('Lỗi khi lưu dữ liệu vào cơ sở dữ liệu.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Thêm Phim Mới</Text>

                {error ? <Text style={styles.errorText}>🛑 {error}</Text> : null}

                {/* Title Input (BẮT BUỘC) */}
                <Text style={styles.label}>Tên Phim (Title)*</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Ví dụ: Inception"
                />

                {/* Year Input (TÙY CHỌN) */}
                <Text style={styles.label}>Năm Phát Hành (Year)</Text>
                <TextInput
                    style={styles.input}
                    value={year}
                    onChangeText={setYear}
                    placeholder={`Ví dụ: ${currentYear - 2}`}
                    keyboardType="numeric"
                />
                
                {/* Rating Input (TÙY CHỌN) */}
                <Text style={styles.label}>Đánh Giá (Rating 1-5)</Text>
                <TextInput
                    style={styles.input}
                    value={rating}
                    onChangeText={setRating}
                    placeholder="Ví dụ: 5"
                    keyboardType="numeric"
                    maxLength={1}
                />

                <View style={styles.buttonContainer}>
                    <Button title="Lưu Phim" onPress={handleSave} />
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