const db = require("../models");
var aws = require('aws-sdk');
var config = require("../config/auth.config")
var uuid = require('uuid');

const Profile = db.profile.Profile;
const DescriptionImage = db.profile.DescriptionImage;

aws.config.signatureVersion = 'v4'
var ep = new aws.Endpoint('https://mesh-storage.sfo3.digitaloceanspaces.com');
var s3 = new aws.S3({endpoint: ep});
s3.config.update({accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey});


exports.ProfileImageLink = (req, res) => {
    Profile.findOne({ user_id: req.userId}).exec(async (err, profile) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!profile) {
           res.status(500).send({message: "User not Found"});
           return
        }

        profileImageURI = profile.profileImage 
        if (!profileImageURI) {
            res.status(500).send({message: "Internal Error"});
            return
        } 


        var params = {
            Bucket: 'ProfileImages', // your bucket name
            Key: profileImageURI, // this generates a unique identifier
            Expires: 100, // number of seconds in which image must be posted
            // ContentType: 'image/jpeg' // must match "Content-Type" header of Alamofire PUT request

        };

        res.send({putURL: s3.getSignedUrl('putObject', params), getURL: s3.getSignedUrl('getObject', params)})

    })

}


exports.addDescriptionToImage = (req, res) => {
    Profile.findOne({ user_id: req.userId}).exec(async (err, profile) => {
        console.log("Request to add description to image received")

        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!profile) {
           res.status(500).send({message: "User not Found"});
           return;
        }

        if (!profile.descriptionImages[req.body.index]) {
            res.status(500).send({message: "Invalid index"});
            return;
        }
        
        DescriptionImage.findById(profile.descriptionImages[req.body.index]).then(async (descriptionImage) => {
            descriptionImage.description = req.body.description
            await descriptionImage.save()
            res.send({"result": "success!"})
        })        

    })
}

exports.getAllDescriptionImages = (req, res) => {
    Profile.findOne({ user_id: req.userId}).exec(async (err, profile) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!profile.descriptionImages) {
           res.status(500).send({message: "User has no description images."});
           return
        }

        
        var resultArray = [];
        for (const element of profile.descriptionImages) {
            await DescriptionImage.findById(element).then((descriptionImage) => {


            var params = {
                Bucket: 'ProfileImages', // your bucket name
                Key: descriptionImage.imageURI, // this generates a unique identifier
                Expires: 100, // number of seconds in which image must be posted
            };

            let description = descriptionImage.description

            resultArray.push({
                "getURL": s3.getSignedUrl('getObject', params), 
                "putURL": s3.getSignedUrl('putObject', params),
                "description": description,
                })
            })
        }
        
        res.send({"models": resultArray, 
        "name": profile.username,
        "linkedInLink": profile.linkedInLink, 
        "contactNumer": ""});
    })

}

exports.fetchDiscoverImagesURLWithDescriptions = async (req, res) => {
    // Return a random user
    var random = Math.floor(Math.random() * ((await Profile.countDocuments({})) - 2))

    Profile.findOne({ user_id: { $nin: ["61ca7e463048a37148814b65", req.userId] } }).skip(random).exec(async (err, profile) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
        
        var resultArray = [];
        for (const element of profile.descriptionImages) {
            await DescriptionImage.findById(element).then((descriptionImage) => {


            var params = {
                Bucket: 'ProfileImages', // your bucket name
                Key: descriptionImage.imageURI, // this generates a unique identifier
                Expires: 100, // number of seconds in which image must be posted
            };

            let description = descriptionImage.description

            resultArray.push({
                "getURL": s3.getSignedUrl('getObject', params), 
                "putURL": s3.getSignedUrl('putObject', params),
                "description": description,
                })
            })
        }

        if (!profile.linkedInLink) {
            profile.linkedInLink = ""
        }
        
        res.send({"models": resultArray, 
        "name": profile.username,
        "linkedInLink": profile.linkedInLink, 
        });
    })

}

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

exports.updateMe = async (req, res) => {
    Profile.findOne({ user_id: req.userId}).exec(async (err, profile) => {
        console.log("Request to update profile to image received")

        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!profile) {
           res.status(500).send({message: "User not Found"});
           return;
        }

        profile.username = req.body.name
        profile.linkedInLink = req.body.linkedInLink
        profile.save()
        
        res.send({"result": "success!"})
              

    })
}