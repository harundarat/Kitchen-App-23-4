import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ResepMakanan = () => {
    const [recipes, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        MyHome();
    }, []);

    const MyHome = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/admin/recipes");
            if (Array.isArray(response.data)) {
                setItems(response.data);
            } else {
                console.error("Unexpected response format: ", response.data);
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-screen-lg mx-auto p-5"> {/* Batas lebar maksimum konten */}
            <form className="w-[400px] mt-7" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="default-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search Recipe"
                        required
                    />
                    <button type="submit" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                </div>
            </form>

            <div className="bg-white rounded-md p-5">
                <div className="overflow-y-auto max-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 font-poppins">Title</th>
                                <th className="p-2 font-poppins">Description</th>
                                <th className="p-2 font-poppins">Total Time</th>
                                <th className="p-2 font-poppins">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredRecipes) && filteredRecipes.length > 0 ? (
                                filteredRecipes.map((recipe) => (
                                    <tr key={recipe._id} className="border-b">
                                        <td className="p-2 text-sm font-poppins">{recipe.title}</td>
                                        <td className="p-2 text-sm font-poppins">{recipe.description}</td>
                                        <td className="p-2 text-sm font-poppins">{recipe.total_time}</td>
                                        <td className="p-2 text-sm font-poppins">{recipe.category}</td>
                                        <td className="p-2">
                                            <Link to={`/DetailResep/${recipe._id}`}>
                                                <button className="bg-blue-700 text-sm text-white px-2 py-1 rounded">Detail</button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-2 text-center">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResepMakanan;
