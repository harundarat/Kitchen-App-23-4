const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getPaginatedRecipes, getRecipeById, createRecipe, editRecipe, deleteRecipe, toggleLikeRecipe, saveRecipe, reportRecipe } = require("../controllers/recipeController");
const { authenticate, authCheck, verifyRecipeAuthor } = require("../middleware/auth");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get paginated recipes
router.get("/", getPaginatedRecipes);

// Get recipe by id
router.get("/:id", authCheck, getRecipeById);

// Create recipe
router.post("/", authenticate, upload.fields([{ name: "image", maxCount: 1 }, { name: "stepImages" }]), createRecipe);

// Edit recipe
router.put("/:id", authenticate, verifyRecipeAuthor, upload.fields([{ name: "image", maxCount: 1 }, { name: "stepImages" }]), editRecipe);

// Delete recipe
router.delete("/:id", authenticate, verifyRecipeAuthor, deleteRecipe);

// Toggle like recipe
router.post("/:id/like", authenticate, toggleLikeRecipe);

// Save or unsave recipe
router.post("/:id/save", authenticate, saveRecipe);

// Report recipe
router.post("/:id/report", authenticate, reportRecipe);

module.exports = router;