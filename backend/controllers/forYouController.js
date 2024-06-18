const Recipe = require('../models/recipe');
const User = require("../models/user");

// Controller to get recipes for the user
const forYouController = async (req, res) => {

    try {

        let recipes;

        // If user is logged in and has preferences
        if (req.user?.preferences) {

            const userPreferences = await User.findOne({ username: req.user.username }).select("preferences");
            const preferences = userPreferences.preferences;

            const rawRecipes = await Recipe.find({ category: { $in: preferences } }).select("_id user_id title image total_time likes category")
                .populate({ path: "user_id", select: "fullName image" })
                .sort({ createdAt: -1 })
                .skip(0)
                .limit(8);

            recipes = rawRecipes.map(recipe => (
                {
                    ...recipe._doc,
                    user_id: recipe.user_id._id,
                    user: {
                        fullName: recipe.user_id.fullName,
                        image: recipe.user_id.image
                    }
                }
            ))

        } else {

            // If user is not logged in or has no preferences
            // Get 8 random recipes
            recipes = await Recipe.aggregate([
                { $sample: { size: 8 } },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        title: 1,
                        image: 1,
                        total_time: 1,
                        likes: 1,
                        category: 1,
                        "user.fullName": 1,
                        "user.image": 1
                    }
                },
                {
                    $unwind: "$user"
                }
            ]);

        }

        return res.status(200).json({
            recipes
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        })
    }

};

module.exports = forYouController;
