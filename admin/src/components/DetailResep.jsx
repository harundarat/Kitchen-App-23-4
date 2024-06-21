// DetailResep.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const DetailResep = () => {
    const [item, setItem] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchRecipeDetail(id);
        }
    }, [id]);

    const fetchRecipeDetail = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/admin/recipe/${id}`);
            console.log(response.data)
            setItem(response.data); // Set the fetched data to state
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    return (
        <div className='w-full bg-white rounded-md p-5'>
            {item ? (
                <div>
                    <h1 className='text-2xl font-bold'>{item.title}</h1>
                    <img src={item.image} alt={item.title} className='w-full h-auto my-4' />
                    <p>{item.description}</p>
                    <p><strong>Total Time:</strong> {item.total_time}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <h2 className='text-xl font-bold mt-4'>Ingredients:</h2>
                    <ul className='list-disc pl-5'>
                        {item.ingredients && item.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                    <h2 className='text-xl font-bold mt-4'>Steps:</h2>
                    <ol className='list-decimal pl-5'>
                        {item.stepDescription && item.stepDescription.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                    <a href={item.video} rel="noopener noreferrer" className='text-blue-500 mt-4 inline-block'>Watch Video</a>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default DetailResep;
