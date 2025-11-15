import { StyleSheet, Text, View, FlatList, Pressable, Alert, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Item, { Movie } from '@/component/Movie'; // Đổi import thành Movie
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
// Đổi import sang hàm lấy phim mới
import { deleteMovieDB, getAllMoviesDB, initDB, toggleWatchedDB } from "@/db/db"; 
import { MaterialIcons } from '@expo/vector-icons';


export default function MovieListScreen() { // Đổi tên component cho đúng ngữ cảnh

    // Đổi tên state và type
    const [movies, setMovies] = useState<Movie[]>([]); 
    const [isLoading, setIsLoading] = useState(true);

    // TRẠNG THÁI MỚI: Search và Filter
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'watched' | 'unwatched'>('all');

    // Tối ưu hóa hàm loadMovies bằng useCallback
    const loadMovies = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllMoviesDB();
            setMovies(data);
        } catch (err) {
            console.error("Lỗi khi tải phim:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
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

    // --- LOGIC MỚI: LỌC/TÌM KIẾM SỬ DỤNG useMemo (TỐI ƯU) ---
    const filteredMovies = useMemo(() => {
        let filtered = movies;

        // 1. Lọc theo trạng thái Đã/Chưa xem
        if (filterStatus === 'watched') {
            filtered = filtered.filter(movie => movie.watched === 1);
        } else if (filterStatus === 'unwatched') {
            filtered = filtered.filter(movie => movie.watched === 0);
        }

        // 2. Lọc theo Title (Tìm kiếm)
        if (searchText.trim()) {
            const lowerCaseSearch = searchText.trim().toLowerCase();
            filtered = filtered.filter(movie => 
                movie.title.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        // Trả về danh sách đã được lọc
        return filtered;
    }, [movies, filterStatus, searchText]);

    
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

            {/* KHU VỰC MỚI: Search và Filter */}
            <View style={styles.searchContainer}>
                {/* 1. Thanh Search */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm theo tên phim..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                
                {/* 2. Bộ lọc Watched */}
                <View style={styles.filterGroup}>
                    {/* Nút All */}
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
                        onPress={() => setFilterStatus('all')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>Tất cả</Text>
                    </TouchableOpacity>
                    {/* Nút Đã xem */}
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'watched' && styles.activeFilter]}
                        onPress={() => setFilterStatus('watched')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'watched' && styles.activeFilterText]}>Đã xem</Text>
                    </TouchableOpacity>
                    {/* Nút Chưa xem */}
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'unwatched' && styles.activeFilter]}
                        onPress={() => setFilterStatus('unwatched')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'unwatched' && styles.activeFilterText]}>Chưa xem</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Danh sách phim */}
            <FlatList
                data={filteredMovies}
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
    },
    searchContainer: {
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: 'white',
    },
    filterGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    activeFilter: {
        backgroundColor: '#007AFF', // Màu xanh dương nổi bật
    },
    filterText: {
        color: '#333',
        fontWeight: '500',
    },
    activeFilterText: {
        color: 'white',
        fontWeight: 'bold',
    },

});