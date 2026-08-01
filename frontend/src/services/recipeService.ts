// URL API dari TheMealDB yang digunakan untuk mencari resep
const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

// Fungsi asinkron untuk mengambil data resep dari TheMealDB API
export const getRecipes = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    // Mengembalikan data resep (array of meals) dari respons
    return data.meals;
  } catch (error) {
    // Menangani kesalahan jika terjadi error saat melakukan permintaan
    console.error("Error fetching recipes:", error);

    // Melempar kesalahan agar bisa ditangani di tempat lain jika diperlukan
    throw error;
  }
};
