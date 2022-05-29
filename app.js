const express = require('express'); // !Importing express into js
const app = express(); // !Binding the Express Module to a function i.e., app

const bodyParser = require('body-parser');
const request = require('request');
const https = require('node:https');
require('dotenv').config();

const port = process.env.PORT || 3000; // !Defining a port to tune our server to

// process.env.PORT: It's a dynamic port and Heroku will decide it on the go
// process.env.PORT || port: Using this web app can be used on heroku as well as locally
app.listen(port, () => {
  console.log("Server is tuned to port " + port);
});

// bodyParser works with express. Below step is always done before using the bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

// this will help to load static files present in the project
app.use(express.static("public"));

// Browser sends GET req to the home route ("/") and will receive the following res.
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  const reqBody = req.body; // Getting data from the post req made by the browser

  // Fetching data inside req body
  const firstName = reqBody.firstName;
  const lastName = reqBody.lastName;
  const email = reqBody.emailAddress;

  // Preparing data that will be sent to the mailchimp api
  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        "FNAME": firstName,
        "LNAME": lastName,
      }
    }]
  }

  const jsonData = JSON.stringify(data);

  // Building an API to be triggered with the data prepared
  const listId = process.env.LIST_ID; // Unique list id
  const dataCenter = process.env.DATA_CENTER // Data center may vary for different users
  const authToken = process.env.API_KEY // Unique auth token
  const userName = process.env.USER_NAME;
  console.log(userName);
  const options = {
    method: "POST",
    auth: userName + ":" + authToken
  }
  url = "https://" + dataCenter + ".api.mailchimp.com/3.0/lists/" + listId;

  // Storing the request to a constant
  const request = https.request(url, options, (httpsRes) => {

    if (httpsRes.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

  });

  request.write(jsonData); // Adding data to be sent to the request
  request.end();

});

app.post("/failure", (req, res) => {
  res.redirect("/");
})
