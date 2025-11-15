import { StyleSheet, Text, View } from "react-native";

// Định nghĩa lại type Movie (đảm bảo id có)
export type Movie = {
    id: number; 
    title: string;
    year: number;
    watched: number; // 0 hoặc 1
    rating: number | null;
    created_at: number;
}

type Props = {
    item: Movie
}

// Cập nhật component để hiển thị Movie data
export default function Item({item} : Props){
    const ratingText = item.rating ? `⭐️ ${item.rating}/5` : 'Chưa đánh giá';
    const watchedText = item.watched === 1 ? '✅ Đã xem' : '🕒 Cần xem';
    
    // TẠO STYLE ĐỘNG: Nếu đã xem, thêm gạch ngang và làm mờ
    const isWatched = item.watched === 1;

    return(
        <View style={[styles.itemContainer, isWatched && styles.watchedContainer]}>
            <View style={styles.infoCol}>
                {/* ÁP DỤNG STYLE GẠCH NGANG CHO TITLE */}
                <Text style={[styles.title, isWatched && styles.strikethrough]}>{item.title}</Text>
                <Text style={styles.year}>Năm: {item.year}</Text>
            </View>
            <View style={styles.statusCol}>
                <Text style={isWatched ? styles.watched : styles.toWatch}>{watchedText}</Text>
                <Text style={styles.rating}>{ratingText}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: 'center',
        borderBottomWidth: 1, 
        borderBottomColor: '#ccc',
        padding: 15,
        backgroundColor: '#f9f9f9',
        marginVertical: 4,
        borderRadius: 8,
    },
    // STYLE MỚI: Làm mờ nền khi đã xem
    watchedContainer: {
        backgroundColor: '#e0f7fa', // Nền màu xanh nhạt
        opacity: 0.8,
    },
    infoCol: {
        flex: 2,
    },
    statusCol: {
        flex: 1,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    // STYLE MỚI: Gạch ngang chữ
    strikethrough: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    year: {
        fontSize: 14,
        color: '#666',
    },
    watched: {
        color: 'green',
        fontWeight: 'bold',
    },
    toWatch: {
        color: 'orange',
        fontWeight: 'bold',
    },
    rating: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
    }
});