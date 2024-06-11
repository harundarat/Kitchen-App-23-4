const express = require("express"); 
const router = express.Router();
const { loginAdmin, logoutAdmin } = require("../controllers/adminController");  
const { deleteUser, deleteRecipe, getAdmin } = require("../controllers/adminController");   

router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.delete("/user/:id", deleteUser);
router.delete("/recipe/:id", deleteRecipe);
router.get("/:username", getAdmin);

module.exports = router;