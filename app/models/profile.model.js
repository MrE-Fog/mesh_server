const mongoose = require("mongoose");

const DescriptionImage = mongoose.model("DescriptionImage", 
    new mongoose.Schema({
        imageURI: String, 
        description: String,
    }));

const Profile = mongoose.model(
    "Profile",
    new mongoose.Schema({
        user_id: String, 
        username: String,
        linkedInLink: String,
        profileImage: String,
        descriptionImages: [String],
    }, {strict: false})
);

exports.DescriptionImage = DescriptionImage;
exports.Profile = Profile;