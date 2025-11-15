import { StyleSheet, Text, View, FlatList, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Item, { Movie } from '@/component/Movie'; // Đổi import thành Movie
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
// Đổi import sang hàm lấy phim mới
import { deleteMovieDB, getAllMoviesDB, initDB, toggleWatchedDB } from "@/db/db"; 
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

    // --- HÀM MỚI: TOGGLE WATCHED ---
    const handleToggleWatched = async (movie: Movie) => {
        try {
            // 1. Cập nhật DB
            await toggleWatchedDB(movie.id, movie.watched);
            console.log(`Movie ID ${movie.id} toggled.`);
            
            // 2. Load lại dữ liệu để cập nhật UI
            await loadMovies(); 

        } catch (err) {
            console.error("Lỗi khi toggle watched:", err);
        }
    }

    // --- HÀM MỚI: XÓA PHIM VÀ XÁC NHẬN ---
    const handleDelete = (id: number) => {
        Alert.alert(
            "Xác nhận xóa phim", 
            "Bạn có chắc chắn muốn xóa bộ phim này khỏi danh sách?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            await deleteMovieDB(id);
                            console.log(`Movie ID ${id} deleted.`);
                            // Cập nhật UI
                            await loadMovies(); 
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể xóa phim.");
                            console.error("Lỗi xóa DB:", error);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    }

    
    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.headerTitle}>🎬 Danh Sách Phim</Text>

            {/* Thanh chức năng (Chỉ giữ lại nút Add) */}
            <View style={styles.functionBar}>
                <Pressable 
                    onPress={()=>router.navigate("/add")}
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
                        <View style={styles.listItemWrapper}>
                            <Pressable 
                                // Nhấn ngắn để toggle watched
                                onPress={() => handleToggleWatched(item)}
                                // Nhấn giữ để SỬA THÔNG TIN
                                onLongPress={()=>router.navigate({pathname:"/update", params: {item: JSON.stringify(item)}})}
                                style={styles.itemContent}
                            >
                                <Item item={item} />
                            </Pressable>
                            
                            {/* NÚT XÓA */}
                            <Pressable 
                                onPress={() => handleDelete(item.id)}
                                style={styles.deleteButton}
                            >
                                <MaterialIcons name="delete-forever" size={24} color="white" />
                            </Pressable>
                        </View>
                        
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
    },
    listItemWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        borderRadius: 8,
    },
    itemContent: {
        flex: 1, // Chiếm phần lớn diện tích
    },
    deleteButton: {
        backgroundColor: '#d9534f', // Màu đỏ
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        marginLeft: 4,
    }
});