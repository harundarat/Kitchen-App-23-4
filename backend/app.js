require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('./config/dbConfig')

const app = express();
const port = process.env.PORT || 3000;

// middleware
// Configure CORS to allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN_PROD 
    ? process.env.CORS_ORIGIN_PROD.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
