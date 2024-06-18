const User = require("../models/user");
const { comparePassword } = require("../utils/hashPass");
const jwt = require("jsonwebtoken");
const validateRequest = require("../utils/validateRequest");

// Login endpoint
const loginUser = async (req, res) => {
    try {
        let data

        const { isValid, filteredReq } = validateRequest(req.body, ["email", "password"])
        if (isValid) {
            data = filteredReq
        } else {
            return res.status(400).json({
                code: "BAD_REQUEST_LOGIN",
                error: "Invalid request body"
            })
        }

        // Check if email exists
        const user = await User.findOne({ email: data.email });
        if (!user) {
            return res.status(404).json({
                code: "EMAIL_NOT_FOUND",
                error: "Email does not exist"
            });
        }

        // // Check if password is correct
        const match = await comparePassword(data.password, user.password);

        if (match) {
            jwt.sign({ username: user.username, id: user._id, preferences: user.preferences }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) throw err;
                res.cookie("token", token, {
                    httpOnly: true
                });
                res.status(200).json({
                    id: user._id,
                    username: user.username,
                    token
                })
            })
        } else {
            res.status(401).json({
                code: "PWD_NOT_MATCH",
                error: "Password is incorrect"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            code: "INTERNAL_SERVER_ERROR",
            error: `Server error: ${error}`
        })
    }
};

// Logout
const logoutUser = (req, res) => {

    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        message: "Logged out successfully"
    });
}

module.exports = {
    loginUser,
    logoutUser
}
