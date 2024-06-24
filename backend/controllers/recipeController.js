const Recipe = require("../models/recipe");
const Like = require("../models/like");
const SaveRecipe = require("../models/saveRecipe");
const Nutrition = require("../models/nutrition");
const ReportRecipe = require("../models/reportRecipe");
const deepl = require('deepl-node');
const axios = require('axios');
const uploadImage = require("../utils/uploadImage");

const getPaginatedRecipes = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;
        const popular = req.query.popular;
        const ingredients = req.query.ingredients;
        const textSearch = `${search} ${ingredients}`

        // Create query and sort objects
        let query = {};
        let sort = { createdAt: -1 }; // Default sort by createdAt

        if (category) {
            query.category = { $in: category.split(",") };
        }

        if (search || ingredients) {
            query.$text = { $search: textSearch };
        }

        if (popular === "true") {
            sort = { likes: -1 };
        }

        // Get paginated recipes
        const recipes = await Recipe.find(query).select("_id user_id title image total_time likes category")
            .populate({ path: "user_id", select: "fullName image" })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        const recipesCount = await Recipe.countDocuments(query);

        let totalPages;
        if (page === 1 && recipes.length < limit) {
            totalPages = 1;
        } else {
            totalPages = Math.ceil(recipesCount / limit);
        }

        res.status(200).json({
            recipes,
            totalPages,
            recipesCount,
            currentPage: page,
            limit
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

const getRecipeById = async (req, res) => {
    try {

        const recipe = await Recipe.findById(req.params.id).populate({ path: "user_id", select: "fullName image username" });
        let nutrition = await Nutrition.find({ recipe_id: req.params.id });

        if (!nutrition[0]?.total_cal) {
            nutrition = null;
        }

        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        // Check if user is authenticated
        if (!req.user?.id) {
            return res.status(200).json({
                recipe: {
                    ...recipe._doc,
                    isLiked: false,
                    nutrition
                }
            });
        } else {
            // Check if user has liked and saved the recipe
            const userLike = await Like.findOne({ recipe_id: req.params.id, user_id: req.user.id });
            const userSave = await SaveRecipe.findOne({ recipe_id: req.params.id, user_id: req.user.id });

            res.status(200).json({
                recipe: {
                    ...recipe._doc,
                    isLiked: !!userLike,
                    isSaved: !!userSave,
                    nutrition
                }

            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

const createRecipe = async (req, res) => {
    try {

        // Get recipe data from request body
        const {
            title,
            image,
            description,
            total_time,
            ingredients, // Array of ingredients
            video,
            stepDescription, // Array of step descriptions
            // stepImage, // Array of step images
            category // Array of categories
        } = req.body;

        // Create new recipe instance
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
                    // image: stepImage[index]
                })),
            },
            category
        });

        // Handle image upload
        if (req.files) {
            const images = req.files;

            // Check if main image is available
            if (images.image?.length === 1) {
                const image = await uploadImage(`images/recipes/${recipe._id}/main.jpg`, images.image[0].buffer);
                recipe.image = image;
            }

            // Check if step images are available
            if (images.stepImages?.length > 0) {
                const stepImagesPromise = images.stepImages.map((image, order) => (uploadImage(`images/recipes/${recipe._id}/step-${order}.jpg`, image.buffer)));
                const stepImages = await Promise.all(stepImagesPromise);
                recipe.steps.step = recipe.steps.step.map((step, index) => ({
                    ...step,
                    image: stepImages[index]
                }))
            }

        }

        // Get nutrition instance from ingredients
        const nutrition = await getNutrition(recipe._id, ingredients);

        // Save the recipe and nutrition to DB
        await recipe.save();
        await nutrition.save();

        // Send response
        res.status(200).json({
            message: "Recipe created successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

const editRecipe = async (req, res) => {

    try {

        const {
            title,
            image,
            description,
            total_time,
            ingredients,
            video,
            stepDescription,
            // stepImage,
            category
        } = req.body;


        const recipe = req.recipe;
        const recipeId = recipe._id;

        // Handle if ingredients was changed
        let nutritionPromise;
        if (ingredients?.length > 0) {

            const newNutrition = await getNutrition(recipeId, ingredients);

            if (newNutrition?.total_cal) {

                const nutrition = await Nutrition.findOne({ recipe_id: recipeId });

                nutrition.total_cal = newNutrition.total_cal;
                nutrition.total_fat = newNutrition.total_fat;
                nutrition.fatsat = newNutrition.fatsat;
                nutrition.protein = newNutrition.protein;
                nutrition.carb = newNutrition.carb;
                nutrition.sugar = newNutrition.sugar;
                nutrition.salt = newNutrition.salt;

                nutritionPromise = nutrition.save();

            } else {

                await Nutrition.updateOne({ recipe_id: recipeId }, {
                    $unset: {
                        total_cal: "",
                        total_fat: "",
                        fatsat: "",
                        protein: "",
                        carb: "",
                        sugar: "",
                        salt: ""
                    }
                });

            }

        }

        recipe.title = title || recipe.title;
        recipe.image = image || recipe.image;
        recipe.description = description || recipe.description;
        recipe.total_time = total_time || recipe.total_time;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.steps.video = video || recipe.steps.video;
        if (stepDescription?.length > 0) {
            recipe.steps.step = stepDescription.map((description) => ({
                description,
                // image: stepImage[index]
            }));
        }
        recipe.category = category || recipe.category;

        const recipePromise = recipe.save();

        // Handle image upload
        if (req.files) {
            const images = req.files;

            if (images.image?.length === 1) {
                const image = await uploadImage(`images/recipes/${recipe._id}/main.jpg`, images.image[0].buffer);
                recipe.image = image;
            }

            if (images.stepImages?.length > 0) {
                const stepImagesPromise = images.stepImages.map((image, order) => (uploadImage(`images/recipes/${recipe._id}/step-${order}.jpg`, image.buffer)));
                const stepImages = await Promise.all(stepImagesPromise);
                recipe.steps.step = recipe.steps.step.map((step, index) => ({
                    ...step,
                    image: stepImages[index]
                }))
            }
        }

        // Execute both promises
        await Promise.all([recipePromise, nutritionPromise]);

        res.status(200).json({
            message: "Recipe updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

const deleteRecipe = async (req, res) => {

    try {

        const recipe = await Recipe.findById(req.params.id);

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

        // Delete the recipe and related data
        await Nutrition.deleteOne({ recipe_id: req.params.id });
        await Like.deleteMany({ recipe_id: req.params.id });
        await SaveRecipe.deleteMany({ recipe_id: req.params.id });
        await recipe.deleteOne();

        res.status(204).json({
            message: "Recipe deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }

}

// Like/unlike recipe
const toggleLikeRecipe = async (req, res) => {

    try {

        const recipe = await Recipe.findById(req.params.id).select("likes");

        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        const userLike = await Like.findOne({ recipe_id: req.params.id, user_id: req.user.id });

        if (!userLike) {

            const like = new Like({
                recipe_id: req.params.id,
                user_id: req.user.id
            });

            await like.save();

            await recipe.updateOne({ likes: recipe.likes + 1 });

            res.status(200).json({
                message: "Recipe liked successfully"
            });

        } else {

            await userLike.deleteOne();
            await recipe.updateOne({ likes: recipe.likes - 1 });

            res.status(200).json({
                message: "Recipe unliked successfully"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }

}

// Save/unsave recipe
const saveRecipe = async (req, res) => {

    try {

        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        const userSave = await SaveRecipe.findOne({ recipe_id: req.params.id, user_id: req.user.id });

        if (!userSave) {

            const saveRecipe = new SaveRecipe({
                recipe_id: req.params.id,
                user_id: req.user.id
            });

            await saveRecipe.save();

            res.status(200).json({
                message: "Recipe saved successfully"
            });

        } else {

            await userSave.deleteOne();

            res.status(200).json({
                message: "Recipe unsaved successfully"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }

}

// Crete report
const reportRecipe = async (req, res) => {
    try {

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            })
        }

        const { reason, description } = req.body;

        const report = new ReportRecipe({
            user_id: req.user.id,
            recipe_id: req.params.id,
            reason,
            description
        })

        await report.save();

        res.json({
            message: "Recipe has been reported"
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

// Function to get nutrition data from ingredients
const getNutrition = async (recipeId, ingredients) => {
    try {

        // Ensure ingredients is in english
        const translator = new deepl.Translator(process.env.DEEPL_AUTH_KEY);
        const translatedIngredients = await translator.translateText(ingredients, "ID", "en-US");
        const ingr = translatedIngredients.map(ingredient => ingredient.text);

        // Edamam API request body
        const edamamReqBody = {
            title: "",
            ingr,
            url: "",
            summary: "",
            yield: "",
            time: "",
            img: "",
            prep: ""
        }

        const edamamResponse = await axios.post(process.env.EDAMAM_API_URL, edamamReqBody, {
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        const data = edamamResponse.data;

        return new Nutrition({
            recipe_id: recipeId,
            total_cal: data.totalNutrients.ENERC_KCAL.quantity,
            total_fat: {
                g: data.totalNutrients.FAT.quantity,
                akg: data.totalDaily.FAT.quantity,
            },
            fatsat: {
                g: data.totalNutrients.FASAT.quantity,
                akg: data.totalDaily.FASAT.quantity,
            },
            protein: {
                g: data.totalNutrients.PROCNT.quantity,
                akg: data.totalDaily.PROCNT.quantity,
            },
            carb: {
                g: data.totalNutrients.CHOCDF.quantity,
                akg: data.totalDaily.CHOCDF.quantity,
            },
            sugar: {
                g: data.totalNutrients.SUGAR.quantity
            },
            salt: {
                mg: data.totalNutrients.NA.quantity,
                akg: data.totalDaily.NA.quantity,
            }
        });

    } catch (_) {
        return new Nutrition({
            recipe_id: recipeId
        });
    }

}

module.exports = {
    getPaginatedRecipes,
    getRecipeById,
    createRecipe,
    editRecipe,
    deleteRecipe,
    toggleLikeRecipe,
    saveRecipe,
    reportRecipe
};