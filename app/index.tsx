import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Item, { Movie } from '@/component/Movie'; // Đổi import thành Movie
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
// Đổi import sang hàm lấy phim mới
import { getAllMoviesDB, initDB } from "@/db/db"; 
import { MaterialIcons } from '@expo/vector-icons';


export default function MovieListScreen() { // Đổi tên component cho đúng ngữ cảnh

    // Đổi tên state và type
    const [movies, setMovies] = useState<Movie[]>([]); 
    const [isLoading, setIsLoading] = useState(true);

    const loadMovies = async () => {
        setIsLoading(true);
        try{
            // TẠO BẢNG VÀ SEED TRƯỚC KHI LẤY DỮ LIỆU
            await initDB(); 
            const dataFromDB = await getAllMoviesDB(); // Lấy dữ liệu phim
            setMovies(dataFromDB);
            console.log("Lấy danh sách phim thành công. Số lượng:", dataFromDB.length);
        }catch(err){
            console.log("Lấy dữ liệu thất bại: " + err);
        } finally {
            setIsLoading(false);
        }
    }
    
    // Sử dụng useFocusEffect để load dữ liệu mỗi khi màn hình được focus
    useFocusEffect(
        useCallback(()=>{
            loadMovies();
        }, [])
    );

    // Hàm render Empty State
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialIcons name="local-movies" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có phim nào trong danh sách.</Text>
            <Text style={styles.emptyHint}>Ấn nút "Thêm" để bắt đầu.</Text>
        </View>
    );


    
    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.headerTitle}>🎬 Danh Sách Phim</Text>

            {/* Thanh chức năng (Chỉ giữ lại nút Add) */}
            <View style={styles.functionBar}>
                <Pressable 
                    // onPress={()=>router.navigate("/add")}
                    style={styles.addButton}
                >
                    <Text style={styles.buttonText}>+ Thêm Phim</Text>
                </Pressable>
            </View>

            {/* Danh sách phim */}
            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={!isLoading ? renderEmpty : null}
                renderItem={({item})=>{
                    return(
                        <Pressable 
                            // Thao tác sửa/chi tiết khi ấn
                            // onPress={()=>router.navigate({pathname:"/update", params: {item: JSON.stringify(item)}})}
                        >
                            <Item item={item} />
                        </Pressable>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
        backgroundColor: "white", 
        padding: 10
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    functionBar: {
        flexDirection: "row", 
        justifyContent: "flex-start", // Chỉ cần nút Add
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: "#007AFF", // Màu xanh dương
        padding: 10, 
        borderRadius: 8, 
        marginVertical: 10
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
        fontWeight: 'bold',
    },
    emptyHint: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    }
});