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
        }

        profileImageURI = ""
        if (!profile.profileImage || profile.profileImage == "") {
            profileImageURI = uuid.v4();
            profile.profileImage = profileImageURI;
            await profile.save();
        } else {
            profileImageURI = profile.profileImage
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
        }

        descriptionImage = new DescriptionImage({
            imageURI: uuid.v4(),
            description: req.body.description
        });

        await descriptionImage.save();

        profile.descriptionImages.push(descriptionImage._id);
        profile.save()
        
        var params = {
            Bucket: 'ProfileDescriptionImages', // your bucket name
            Key: descriptionImage.imageURI, // this generates a unique identifier
            Expires: 100, // number of seconds in which image must be posted
            // ContentType: 'image/jpeg' // must match "Content-Type" header of Alamofire PUT request

        };

        res.send({putURL: s3.getSignedUrl('putObject', params), getURL: s3.getSignedUrl('getObject', params)})

    })
}