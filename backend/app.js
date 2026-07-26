require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('./config/dbConfig')

const app = express();
const port = process.env.PORT || 3000;

// middleware
// Configure CORS to allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN_PROD;

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes"));

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Server is running on port ${port}`));
}

// Export for Vercel serverless
module.exports = app;
