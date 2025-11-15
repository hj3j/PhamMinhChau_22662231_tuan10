import { Movie } from "@/component/Movie";
import * as SQLite from "expo-sqlite" 

const db = SQLite.openDatabaseSync("watchlist.db")

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
        // Kiểm tra số lượng bản ghi hiện có...
        const result = await db.getFirstSync<{ count: number }>("SELECT COUNT(id) as count FROM movies");

        if (result && result.count === 0) {
            
            // SỬA LỖI: Thêm created_at (kiểu number) vào dữ liệu mẫu
            // Dữ liệu mẫu (không cần id, DB sẽ tự tạo)
            const sampleMovies = [
                { title: "Inception", year: 2010, watched: 0, rating: null, created_at: Date.now() },
                { title: "Interstellar", year: 2014, watched: 1, rating: 5, created_at: Date.now() + 1000 },
                { title: "Dune", year: 2021, watched: 0, rating: null, created_at: Date.now() + 2000 },
            ];

            const insertStatement = db.prepareSync(
                // Cấu trúc INSERT đã đúng
                "INSERT INTO movies (title, year, watched, rating, created_at) VALUES (?, ?, ?, ?, ?)"
            );

            for (const movie of sampleMovies) {
                // created_at đã được thêm vào đối tượng movie
                insertStatement.executeSync(
                    movie.title, 
                    movie.year, 
                    movie.watched, 
                    movie.rating, 
                    movie.created_at // Dùng giá trị đã nhất quán
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

// Hàm lấy tất cả phim
export const getAllMoviesDB = async () => {
    return await db.getAllAsync<Movie>(
        "SELECT * FROM movies" 
    );
}

// --- HÀM MỚI: INSERT PHIM MỚI ---
export const insertMovieDB = async (
    title: string, 
    year: number | null, 
    rating: number | null
) => {
    // watched mặc định là 0, created_at là timestamp hiện tại (INTEGER)
    const watched = 0;
    const created_at = Date.now(); 

    // Chuẩn bị câu lệnh SQL
    const sql = `
        INSERT INTO movies 
        (title, year, watched, rating, created_at) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    // year và rating có thể là null
    await db.runAsync(sql, [
        title, 
        year, 
        watched, 
        rating, 
        created_at
    ]);
};