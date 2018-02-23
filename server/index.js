var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var db = require("../database/databaseHelpers");
var session = require("express-session");
var twilio = require("twilio");
var app = express();
var moment = require("moment");
var geo = require("./geoHelper.js")

app.use(express.static(__dirname + "/../client/dist"));
app.use(bodyParser.json());
app.use(
  session({
    secret: "this-is-a-secret-token",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
  })
);

// Due to express, when you load the page, it doesnt make a get request to '/', it simply serves up the dist folder

/************************************************************/
//                   General Routes
/************************************************************/

//This route fetches all posting from the database and sends them to the client
//later this function should receive the zip code of the authenticated user and display
//only relevant postings to the user
app.get("/fetch", function(req, res) {
  console.log("retrieving from database...");
  db.query("SELECT * FROM post WHERE isClaimed=false;", (err, results) => {
    if (err) console.log("FAILED to retrieve from database");
    else {
      console.log("succesfully retireved from database");
      console.log(results);
      res.send(results);
    }
  });
});

//This route receives a request upon submit from the form. The form holds all fields necesaary
//to make a new db entry. This route will take in the request and simply save to the db
app.post("/savepost", function(req, res) {
  console.log("HELLO", req.body);
  var listing = req.body;
  console.log("saving to database...");
  db.query(
    `INSERT INTO post (title, description, address, city, state, zipCode, phone, isClaimed, createdAt, photoUrl) VALUES ("${
      listing.title
    }", "${listing.description}", "${listing.address}","${listing.city}", "${
      listing.state
    }", "${listing.zipCode}", "${listing.phone}", ${
      listing.isClaimed
    }, "${moment().unix()}", "${listing.photoUrl}");`,
    (err, data) => {
      if (err) console.log("Error saving to database", err);
      console.log("succesfully saved to database");
      res.end();
    }
  );
});

app.post("/latlong", function(req, res) {
  geo(req.body.address, function(lat, long) {
    let result = {lat: lat, long: long};
    res.send(result);
    res.end();
  });
});

//This route handles updating a post that has been claimed by the user
app.post("/updateentry", function(req, res) {
  console.log("updating entry...");
  var postID = req.body.postID;
  db.query(
    `UPDATE post SET isClaimed=true WHERE id="${postID}"`,
    (err, data) => {
      if (err) console.log("Unable to claim item :(", err);
      console.log("Claimned post with id: " + postID + "!");
      res.end();
    }
  );
});

/************************************************************/
//                   authentication
/************************************************************/
app.post("/signup", function(req, res) {
  var sqlQuery = `INSERT INTO claimer (claimerUsername, claimerZipCode, cPassword) VALUES (?, ?, ?)`;
  var placeholderValues = [
    req.body.username,
    req.body.zipcode,
    req.body.password
  ];
  db.query(sqlQuery, placeholderValues, function(error) {
    if (error) {
      throw error;
    } else {
      res.end();
    }
  });
});

app.post("/login", function(req, res) {
  var sqlQuery = `SELECT claimerUsername FROM claimer WHERE claimerUsername="${
    req.body.username
  }" AND cPassword ="${req.body.password}"`;
  db.query(sqlQuery, function(error, results) {
    if (error) {
      throw error;
    } else if (results.length === 0) {
      console.log("Failed to login");
    } else {
      req.session.regenerate(err => {
        req.session.username = req.body.username;
        console.log("session", req.session);
        console.log("session username", req.session.username);
      });
      res.end();
    }
  });
});

/************************************************************/
//                   twilio
/************************************************************/

app.post("/chat", function(req, res) {
  var accountSid = "AC295216dc5e0bd27a16271da275b0c36f"; // Your Account SID from www.twilio.com/console
  var authToken = "14a805bc4b3f3c784aaa5e4e16acc449"; // Your Auth Token from www.twilio.com/console
  var client = new twilio(accountSid, authToken);

  client.messages
    .create({
      body: `Thank you for claiming ${req.body.title} and helping the world !`,
      to: '+19296660205', // Text this number - this is hard coded unless you'd like to upgrade your account =) 
      from: "+14255054003 " // From a valid Twilio number
    })
    .then(message => {
      var client2 = new twilio(accountSid, authToken);
      console.log(message.sid);
      client2.messages
        .create({
          body: `Your posting ${req.body.title} has been claimed ! You'll be contacted soon !`,
          to: +'19162567256', // Text this number this is hard coded unless you'd like to upgrade your account =) 
          from: "+14255054003 " // From a valid Twilio number
        })
        .then(message => {
          console.log(message.sid);
          res.end();
        });
      // res.end()
    });
});

var _PORT = process.env.PORT || 3000;
app.listen(_PORT, function() {
  console.log("listening on port 3000!");
});
