import axios from 'axios'; // Mengimpor library axios untuk melakukan permintaan HTTP

// URL API dari TheMealDB yang digunakan untuk mencari resep
const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

// Fungsi asinkron untuk mengambil data resep dari TheMealDB API
export const getRecipes = async () => {
    try {
        // Melakukan permintaan GET ke API_URL dan menyimpan respons ke dalam variabel response
        const response = await axios.get(API_URL);

        // Mengembalikan data resep (array of meals) dari respons
        return response.data.meals;
    } catch (error) {
        // Menangani kesalahan jika terjadi error saat melakukan permintaan
        console.error('Error fetching recipes:', error);

        // Melempar kesalahan agar bisa ditangani di tempat lain jika diperlukan
        throw error;
    }
};

