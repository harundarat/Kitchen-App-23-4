const Nutrition = require("../models/nutrition");

const searchNutritionByGizi = async (req, res) => {
    try {

        const total_cal = req.query.total_cal;
        const total_fat = req.query.total_fat;
        const fatsat = req.query.fatsat;
        const protein = req.query.protein;
        const carb = req.query.carb;
        const sugar = req.query.sugar;
        const salt = req.query.salt;

        let query = {};
        if (total_cal) {
            query.total_cal = { $lte: total_cal };
            projection = { 'total_cal.g': 1, _id: 0 }
        }
        if (total_fat) {
            query.total_fat = { $lte: total_fat };
            projection = { 'total_fat.g': 1, _id: 0 }
        }
        if (fatsat) {
            query.fatsat = { $lte: fatsat };
            projection = { 'fatsat.g': 1, _id: 0 }
        }
        if (protein) {
            query.protein = { $gte: protein };
            projection = { 'protein.g': 1, _id: 0 }
        }
        if (carb) {
            query.carb = { $gte: carb };
            projection = { 'carb.g': 1, _id: 0 }
        }
        if (sugar) {
            query.sugar = { $lte: sugar };
            projection = { 'sugar.g': 1, _id: 0 }
        }
        if (salt) {
            query.salt = { $lte: salt };
            projection = { 'salt.mg': 1, _id: 0 }
        }

        const searchgizi = await Nutrition.find(query.$lte).limit(1)
        res.status(200).json(searchgizi);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = searchNutritionByGizi;