import { StyleSheet, Text, View } from "react-native";

// Đổi tên và cấu trúc Type
export type Movie = {
    id: number;
    title: string;
    year: number;
    watched: number; // 0 hoặc 1
    rating: number | null; // 1-5
    created_at: number; // Sửa tên thành created_at cho nhất quán
}


type Props = {
    item: Movie
}

// Cập nhật component để hiển thị Movie data
export default function Item({item} : Props){
    const ratingText = item.rating ? `⭐️ ${item.rating}/5` : 'Chưa đánh giá';
    const watchedText = item.watched === 1 ? '✅ Đã xem' : '🕒 Cần xem';
    
    return(
        <View style={styles.itemContainer}>
            <View style={styles.infoCol}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.year}>Năm: {item.year}</Text>
            </View>
            <View style={styles.statusCol}>
                <Text style={item.watched === 1 ? styles.watched : styles.toWatch}>{watchedText}</Text>
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