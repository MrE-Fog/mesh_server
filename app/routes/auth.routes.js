const { verifySignUp, authJwt} = require("../middlewares");
const controller = require("../controllers/auth.controller");
const User = require("../models/user.model");
const Profile = require("../models/profile.model");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmail,
        ],
        controller.signup
    );

    app.post("/api/auth/signin", controller.signin);

    app.get("/api/auth/me", authJwt.verifyToken , async (req, res) => {
        try {
            // request.user is getting fetched from Middleware after token authentication
            // const user = await User.findById(req.userId);
            const profile = await Profile.findOne({ user_id: req.userId});
            return res.json(profile);
        } catch (e) {
            res.send({ message: "Error in Fetching user" });
        }
    });

};