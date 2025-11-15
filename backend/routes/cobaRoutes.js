const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { cobaUpload } = require("../controllers/cobaController");

router.post("/", upload.single('image'), cobaUpload);

module.exports = router;