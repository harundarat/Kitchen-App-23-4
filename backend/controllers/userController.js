const User = require("../models/user");
const Recipe = require("../models/recipe");
const SaveRecipe = require("../models/saveRecipe");
const Like = require("../models/like");
const { hashPassword, comparePassword } = require("../utils/hashPass");
const uploadImages = require("../utils/uploadImage");

// Create new user
const registerUser = async (req, res) => {

    try {
        const { username, fullName, email, password, preferences } = req.body;

        // Check if fullName was entered
        if (!fullName) {
            return res.status(400).json({
                error: "Name is required"
            });
        }

        // Check if password is good
        if (!password || password.length < 6) {
            return res.status(400).json({
                error: "Password is required and should be at least 6 characters long"
            });
        }

        // Check if username was exists
        const unameExist = await User.findOne({ username });

        if (unameExist) {
            return res.status(400).json({
                error: "username already exists"
            });
        }

        // Check if email was exists
        const exist = await User.findOne({ email });

        if (exist) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }

        const hashedPassword = await hashPassword(password);
        // Create new user
        const user = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
            preferences
        });
        await user.save();

        res.status(200).json(
            {
                message: "User created successfully!",
                fullName,
                email
            }
        );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

// Get user profile by username
const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");
        const page = parseInt(req.query.page) || 1;
        const limit = 16;
        const skip = (page - 1) * limit; // calculate number of recipes to skip

        const recipe = await Recipe.find({ user_id: user._id })
            .select("_id user_id title image total_time likes category")
            .skip(skip)
            .limit(limit);
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.status(200).json({
            user,
            recipe
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

// Get saved recipes
const getUserSavedRecipes = async (req, res) => {
    try {

        // Get page, limit, category, sort and search query from request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Get total saved recipes count
        const totalSavedRecipes = await SaveRecipe.countDocuments({ user_id: req.user.id });

        // Calculate total pages
        const totalPages = Math.ceil(totalSavedRecipes / limit);

        // Get paginated saved recipes
        const savedRecipes = await SaveRecipe.find({ user_id: req.user.id }).select("recipe_id")
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get recipe ids
        const recipeIds = savedRecipes.map(savedRecipe => savedRecipe.recipe_id);

        // Get recipes by ids
        const recipes = await Recipe.find({ _id: { $in: recipeIds } }).select("_id user_id title image total_time likes category");

        res.status(200).json({
            recipes,
            totalPages,
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

// Get liked recipes
const getUserLikedRecipes = async (req, res) => {
    try {

        // Get page, limit, category, sort and search query from request
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Get total liked recipes count
        const totalLikedRecipes = await Like.countDocuments({ user_id: req.user.id });

        // Calculate total pages
        const totalPages = Math.ceil(totalLikedRecipes / limit);

        // Get paginated liked recipes
        const likedRecipes = await Like.find({ user_id: req.user.id }).select("recipe_id")
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get recipe ids
        const recipeIds = likedRecipes.map(likedRecipe => likedRecipe.recipe_id);

        // Get recipes by ids
        const recipes = await Recipe.find({ _id: { $in: recipeIds } }).select("_id user_id title image total_time likes category");

        res.status(200).json({
            recipes,
            totalPages,
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

// Edit user profile by username
const editUser = async (req, res) => {
    let imageUrl
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: "Please provide data to update"
            });
        }
        if (req.file) {
            const image = await uploadImages(`images/users/${req.params.username}.jpg`, req.file.buffer);
            imageUrl = image;
        }
        const user = await User.findOne({ username: req.params.username }).select("-activity");
        // Update user profile
        user.image = imageUrl || user.image;
        user.username = req.body.username || user.username;
        user.fullName = req.body.fullName || user.fullName;
        user.email = req.body.email || user.email;
        user.website = req.body.website || user.website;
        user.bio = req.body.bio || user.bio;
        user.password = user.password;

        await user.save();

        res.status(200).json({
            message: "User profile updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
}

// Delete user profile by username
const deleteUser = async (req, res) => {
    try {

        // password is required to delete user
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                error: "Password is required"
            });
        }

        // Find user by username
        const user = await User.findOne({ username: req.params.username }).select("password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const isMatch = await comparePassword(password, user.password);

        // Check if password is correct
        if (!isMatch) {
            return res.status(400).json({
                error: "Incorrect password"
            });

        } else {

            // Delete user
            await user.deleteOne();
            res.status(200).json({
                message: "User deleted successfully"
            });

        }

    } catch (error) {

        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });

    }
}

module.exports = {
    getUser,
    getUserSavedRecipes,
    getUserLikedRecipes,
    registerUser,
    editUser,
    deleteUser
};