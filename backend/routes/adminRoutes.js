const express = require("express");
const router = express.Router();
const { loginAdmin, logoutAdmin, getReportedRecipes } = require("../controllers/adminController");
const { getUserById, getUserByUsername, deleteUser, getRecipeByIdOrTitle, getAllRecipesAdmin, getRecipeById, deleteRecipeAdmin, getAdmin, getUsers } = require("../controllers/adminController");
const { authenticate, onlyAdmin } = require("../middleware/auth");

router.get("/reports", authenticate, onlyAdmin, getReportedRecipes);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/users", getUsers);
router.get("/user/:id", getUserById);
router.get("/user/username/:username", getUserByUsername);
router.get("/recipes", getAllRecipesAdmin);
router.get("/recipe/:id", getRecipeById);
router.get("/recipe", getRecipeByIdOrTitle);
router.delete("/user/:id", deleteUser);
router.delete("/recipe/:id", deleteRecipeAdmin);
router.get("/:username", getAdmin);

module.exports = router;