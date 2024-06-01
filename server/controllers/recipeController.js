const Recipe = require("../models/recipe");
const Like = require("../models/like");

// Get all recipes

// Create recipe
const createRecipe = async (req, res) => {
    try {

        // Get recipe data from request body
        const {
            title,
            image,
            description,
            total_time,
            ingredients,
            video,
            stepDescription,
            stepImage,
            category
        } = req.body;

        // Create new recipe
        const recipe = new Recipe({
            user_id: req.user.id,
            title,
            image,
            description,
            total_time,
            ingredients,
            steps: {
                video,
                step: stepDescription.map((description, index) => ({
                    description,
                    image: stepImage[index]
                })),
            },
            category
        });

        await recipe.save();

        // Send response
        res.json({
            message: "Recipe created successfully"
        });

    } catch (error) {
        console.log(error);
        res.json({
            error: "Server error"
        });
    }
}

// Edit recipe
const editRecipe = async (req, res) => {

    try {

        // Get recipe data from request body
        const {
            title,
            image,
            description,
            total_time,
            ingredients,
            video,
            stepDescription,
            stepImage,
            category
        } = req.body;

        // Find recipe by id
        const recipe = await Recipe.findById(req.params.id);

        // Check if recipe exists
        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        // Check if user is authorized to edit recipe
        if (recipe.user_id.toString() !== req.user.id) {
            return res.status(403).json({
                error: "You are not authorized to edit this recipe"
            });
        }

        // Update recipe data
        recipe.title = title || recipe.title;
        recipe.image = image || recipe.image;
        recipe.description = description || recipe.description;
        recipe.total_time = total_time || recipe.total_time;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.steps.video = video || recipe.steps.video;
        if (stepDescription && stepImage && stepDescription.length === stepImage.length) {
            recipe.steps.step = stepDescription.map((description, index) => ({
                description,
                image: stepImage[index]
            }));
        }
        recipe.category = category || recipe.category;

        await recipe.save();

        // Send response
        res.json({
            message: "Recipe updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.json({
            error: "Server error"
        });
    }
}

// Delete recipe
const deleteRecipe = async (req, res) => {

    try {

        // Find recipe by id
        const recipe = await Recipe.findById(req.params.id);

        // Check if recipe exists
        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        // Check if user is authorized to delete recipe
        if (recipe.user_id.toString() !== req.user.id) {
            return res.status(403).json({
                error: "You are not authorized to delete this recipe"
            });
        }

        await recipe.deleteOne();

        // Send response
        res.json({
            message: "Recipe deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.json({
            error: "Server error"
        });
    }

}

// Toggle like recipe
const toggleLikeRecipe = async (req, res) => {

    try {
        const recipe = await Recipe.findById(req.params.id).select("likes");

        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        const userLike = await Like.findOne({ recipe_id: req.params.id, user_id: req.user.id });

        // Check if user has already liked the recipe
        if (!userLike) {

            // Create new like
            const like = new Like({
                recipe_id: req.params.id,
                user_id: req.user.id
            });

            await like.save();

            // Update recipe likes count
            await recipe.updateOne({ likes: recipe.likes + 1 });

            res.json({
                message: "Recipe liked successfully"
            });

        } else {

            // Unlike recipe
            await userLike.deleteOne();

            // Update recipe likes count
            await recipe.updateOne({ likes: recipe.likes - 1 });

            res.json({
                message: "Recipe unliked successfully"
            });
        }

    } catch (error) {
        console.log(error);
        res.json({
            error: "Server error"
        });
    }

}

module.exports = {
    createRecipe,
    editRecipe,
    deleteRecipe,
    toggleLikeRecipe
};