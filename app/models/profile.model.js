const mongoose = require("mongoose");

const Profile = mongoose.model(
    "Profile",
    new mongoose.Schema({
        user_id: String, 
        username: String,
        profileImage: String,
    }, {strict: false})
);

module.exports = Profile;