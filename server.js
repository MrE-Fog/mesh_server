const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require('https');
const fs = require('fs');


const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('certificate.crt')
};
const app = express();


var corsOptions = {
    origin: "https://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
require('./app/routes/auth.routes')(app);

db.mongoose
    .connect(`mongodb://127.0.0.1:27017/mesh_db`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });


// simple route
// app.get("/", (req, res) => {
//     res.json({ message: "Welcome to bezkoder application." });
// });



// set port, listen for requests
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}.`);
// });

const PORT_SSL = process.env.PORT || 443;
https.createServer(options, app).listen(PORT_SSL, () => {
    console.log(`Server is running on port ${PORT_SSL}.`);
});




