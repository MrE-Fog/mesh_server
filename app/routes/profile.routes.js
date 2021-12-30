const {authJwt} = require("../middlewares");
const controller = require("../controllers/profile.controller");

module.exports = function (app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/profile/profileImageLink", authJwt.verifyToken, controller.ProfileImageLink);

    app.post("/api/profile/addDescriptionToImage", authJwt.verifyToken, controller.addDescriptionToImage);

    app.get("/api/profile/getAllDescriptionImages", authJwt.verifyToken, controller.getAllDescriptionImages);

    app.get("/api/profile/fetchDiscoverImagesURLWithDescriptions", authJwt.verifyToken, controller.fetchDiscoverImagesURLWithDescriptions);

}