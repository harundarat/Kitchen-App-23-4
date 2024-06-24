const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const Recipe = require("../models/recipe");
const Admin = require("../models/admin");

/**
 * Middleware function to authenticate user token.
 * 
 * This middleware function checks if a token is provided in the request cookies.
 * If no token is provided, it returns a 401 status code with an error message.
 * If a token is provided, it verifies the token and decodes the payload.
 * The decoded payload is then attached to the request object as req.user.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authenticate = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            error: "Access denied. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({
            error: "Invalid token"
        });
    }

}

/**
 * Middleware to authorize user access.
 * 
 * This middleware function checks if the username in the request parameters
 * matches the username in the decoded token (req.user).
 * If the usernames match, it calls the next middleware function.
 * If the usernames do not match, it returns a 403 status code with an error message.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authorize = (req, res, next) => {
    if (req.user.username === req.params.username) {
        next();
    } else {
        return res.status(403).json({
            error: "You are not authorized to perform this action"
        });
    }
}


/**
 * Middleware function to check the authentication status of a user.
 *
 * This middleware function checks if a token is provided in the request cookies.
 * If no token is provided, it sets req.user to null and calls the next middleware function.
 * If a token is provided, it verifies the token and decodes the payload.
 * The decoded payload is then attached to the request object as req.user.
 * If there is an error during the verification of the token, it sets req.user to null and calls the next middleware function.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authCheck = (req, res, next) => {
    const token = req.cookies.token;

    // Check if token is provided
    if (!token) {

        req.user = null;
        next();

    } else {

        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            next();
        } catch (error) {
            req.user = null;
            next();
        }

    }
}

/**
 * Middleware function to verify the author of a recipe.
 * 
 * This middleware function checks if the user id in the decoded token (req.user.id)
 * matches the user id of the recipe author.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object.
 */
const verifyRecipeAuthor = async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        // Check if recipe exists
        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found"
            });
        }

        // Check if user is the author of the recipe
        if (req.user.id.toString() === recipe.user_id.toString()) {
            // Attach recipe to request object
            req.recipe = recipe;
            next();
        } else {
            return res.status(403).json({
                error: "You are not authorized to perform this action"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

const onlyAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(403).json({
                error: "You are not authorized to perform this action"
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    authenticate,
    authorize,
    authCheck,
    verifyRecipeAuthor,
    onlyAdmin
};