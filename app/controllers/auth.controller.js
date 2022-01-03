const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Profile = db.profile.Profile
const DescriptionImage = db.profile.DescriptionImage;

var uuid = require('uuid');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    const profile = new Profile({
        user_id: user._id,
        username: req.body.username,
        profileImage: ""
    });

    for (var i = 0; i < 3; i++) {
        let generatedURI = uuid.v4()
        descriptionImage = new DescriptionImage({
                imageURI: generatedURI,
                description: ""
        });
        await descriptionImage.save();
        profile.descriptionImages.push(descriptionImage._id);

        
        if (i == 0) {
            profile.profileImage = generatedURI
        }
    }

    

    user.save((err) => {
        if (err) {
            res.status(500).send({ message: err });
            return
        }
    });

    profile.save((err) => {
        if (err) {
            res.status(500).send({ message: err });
            return
        }
    });

    res.send({ message: "User was registered successfully!" });
};

exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: "User with email Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });


            res.status(200).send({
                id: user._id,
                email: user.email,
                accessToken: token
            });
        });
};

// Will be deprecated
exports.me = async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        // const user = await User.findById(req.userId);
        const profile = await Profile.findOne({ user_id: req.userId});
        return res.json(profile);
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
}


exports.challenge = (req, res) => {
    res.send("success")
}