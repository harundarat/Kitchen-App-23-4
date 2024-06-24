const User = require("../models/user");
const Recipe = require("../models/recipe");
const SaveRecipe = require("../models/saveRecipe");
const Like = require("../models/like");
const { hashPassword, comparePassword } = require("../utils/hashPass");
const uploadImages = require("../utils/uploadImage");
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {

    try {
        const { username, fullName, email, password, preferences } = req.body;

        if (!fullName) {
            return res.status(400).json({
                error: "Fullname is required"
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                error: "Password is required and should be at least 6 characters long"
            });
        }

        const unameExist = await User.findOne({ username });
        if (unameExist) {
            return res.status(400).json({
                error: "username already exists"
            });
        }

        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json({
                error: "Email already exists"
            });
        }

        // Hash password then save user
        const hashedPassword = await hashPassword(password);
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

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Get user recipes
        const recipe = await Recipe.find({ user_id: user._id })
            .select("_id user_id title image total_time likes category")

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

const getUserSavedRecipes = async (req, res) => {
    try {

        const totalSavedRecipes = await SaveRecipe.countDocuments({ user_id: req.user.id });

        const savedRecipes = await SaveRecipe.find({ user_id: req.user.id }).select("recipe_id")
            .sort({ created_at: -1 })

        const recipeIds = savedRecipes.map(savedRecipe => savedRecipe.recipe_id);

        // Get recipes by ids
        const recipes = await Recipe.find({ _id: { $in: recipeIds } }).select("_id user_id title image total_time likes category")
            .populate({ path: 'user_id', select: 'fullName image' });

        res.status(200).json({
            totalSavedRecipes,
            recipes
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

const getUserLikedRecipes = async (req, res) => {
    try {

        const totalLikedRecipes = await Like.countDocuments({ user_id: req.user.id });

        const likedRecipes = await Like.find({ user_id: req.user.id }).select("recipe_id")
            .sort({ created_at: -1 });

        const recipeIds = likedRecipes.map(likedRecipe => likedRecipe.recipe_id);

        // Get recipes by ids
        const recipes = await Recipe.find({ _id: { $in: recipeIds } }).select("_id user_id title image total_time likes category")
            .populate({ path: 'user_id', select: 'fullName image' });

        res.status(200).json({
            totalLikedRecipes,
            recipes,
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
        // Check if data was provided
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: "Please provide data to update"
            });
        }

        // Check if the user inserts an image
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

        // Check if password is correct
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                error: "Incorrect password"
            });
        }

        await user.deleteOne();

        res.status(200).json({
            message: "User deleted successfully"
        });

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