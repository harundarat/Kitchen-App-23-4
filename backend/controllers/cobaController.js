const uploadImages = require("../utils/uploadImage");

const cobaUpload = async (req, res) => {
    try {
        if (req.file) {
            const image = await uploadImages(`images/users/${req.params.username}.jpg`, req.file.buffer);
            imageUrl = image;
        }

        res.json({
            imageUrl
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = {
    cobaUpload
}