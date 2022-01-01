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

    app.get("/api/auth/me", authJwt.verifyToken , controller.me);
    app.get("/api/auth/challenge", authJwt.verifyToken , controller.challenge);

};