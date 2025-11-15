import * as SQLite from "expo-sqlite" 

const db = SQLite.openDatabaseSync("watchlist.db")


// Định nghĩa một interface/type đơn giản cho Movie để tiện cho hàm seed
interface Movie {
    title: string;
    year: number;
    watched: number; // 0 hoặc 1
    rating: number | null; // Có thể null
}

/**
 * Hàm khởi tạo bảng MOVIES nếu chưa tồn tại
 * và kiểm tra để seed dữ liệu mẫu.
 */
export const initDB = async () => {
    try {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                year INTEGER,
                watched INTEGER DEFAULT 0, 
                rating INTEGER,      
                created_at INTEGER
            );
        `);
        console.log("Tạo bảng MOVIES thành công hoặc đã tồn tại.");

        // 2. KIỂM TRA VÀ SEED DỮ LIỆU
        await seedSampleMovies();
        
    } catch (error) {
        console.log("Lỗi khởi tạo DB: " + error);
    }
};

/**
 * Hàm kiểm tra và chèn dữ liệu mẫu (chỉ khi bảng trống).
 */
const seedSampleMovies = async () => {
    try {
        // Kiểm tra số lượng bản ghi hiện có trong bảng movies
        const result = await db.getFirstSync<{ count: number }>("SELECT COUNT(id) as count FROM movies");

        if (result && result.count === 0) {
            
            const sampleMovies: Movie[] = [
                { title: "Inception", year: 2010, watched: 0, rating: null },
                { title: "Interstellar", year: 2014, watched: 1, rating: 5 },
                { title: "Dune", year: 2021, watched: 0, rating: null },
            ];

            const insertStatement = db.prepareSync(
                "INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)"
            );

            for (const movie of sampleMovies) {
                const createdAt = Date.now(); // Sử dụng timestamp làm created_at
                insertStatement.executeSync(
                    movie.title, 
                    movie.year, 
                    movie.watched, 
                    movie.rating, 
                    createdAt
                );
            }
            insertStatement.finalizeSync();
            console.log("Seed 3 phim mẫu thành công.");

        } else {
            console.log(`Bảng movies đã có ${result?.count} bản ghi. Bỏ qua seeding.`);
        }
    } catch (error) {
        console.log("Lỗi khi seed dữ liệu: " + error);
    }
};