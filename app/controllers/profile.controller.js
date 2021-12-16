const db = require("../models");
const User = db.user;


exports.updateProfileImage = (req, res) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            res.status(500).send({ message: "User Not Found" });
            return;
        }

        user.update({"profileImageLink": req.body.imageURL});
        res.send({message: "Profile Picture Updated!"});
    })

}