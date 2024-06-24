const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportRecipeSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipe_id: {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: () => Date.now()
    }
});

const reportRecipeModel = mongoose.model("ReportRecipe", reportRecipeSchema);

module.exports = reportRecipeModel;