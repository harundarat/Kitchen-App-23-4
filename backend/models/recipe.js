const mongoose = require("mongoose");
const { Schema } = mongoose;

const recipeSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: String,
    description: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: () => Date.now()
    },
    edited_at: {
        type: Date,
        default: () => Date.now()
    },
    total_time: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    ingredients: {
        type: [String],
        required: true
    },
    steps: {
        video: {
            type: String,
            default: ""
        },
        step: {
            type: [
                {
                    description: String,
                    image: String
                }
            ],
            required: true
        }
    },
    category: {
        type: [String],
        default: []
    }
});

recipeSchema.index(
    { title: "text", ingredients: "text" },
    { weights: { title: 5, ingredients: 1 } }
);
recipeSchema.virtual('nutrition',
    {
        ref: 'Nutrition',
        localField: '_id',
        foreignField: 'recipe_id',
        justOne: true
    })

const recipeModel = mongoose.model("Recipe", recipeSchema);

module.exports = recipeModel;