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


exports.addDescriptionImage = (req, res) => {
    Profile.findOne({ user_id: req.userId}).exec(async (err, profile) => {
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
        

        descriptionImage = new DescriptionImage({
            imageURI: uuid.v4(),
            description: req.body.description
        });

        await descriptionImage.save();

        console.log(`specified index: ${req.body.index}`);
        profile.descriptionImages[req.body.index] = descriptionImage._id;
        profile.save()
        
        var params = {
            Bucket: 'ProfileImages', // your bucket name
            Key: descriptionImage.imageURI, // this generates a unique identifier
            Expires: 100, // number of seconds in which image must be posted
            // ContentType: 'image/jpeg' // must match "Content-Type" header of Alamofire PUT request

        };

        res.send({putURL: s3.getSignedUrl('putObject', params), getURL: s3.getSignedUrl('getObject', params)})

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

            console.log(descriptionImage.imageURI,);

            resultArray.push({
                "getURL": s3.getSignedUrl('getObject', params), 
                "putURL": s3.getSignedUrl('putObject', params),
                "description": description,
                })
            })
        }
        
        res.send({"models": resultArray});
    })

}