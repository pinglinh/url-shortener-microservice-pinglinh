"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

const AutoIncrement = require("mongoose-sequence")(mongoose);

/** this project needs a db !! **/

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model("Url", urlSchema);

app.post("/api/shorturl/new", async function(req, res) {
  console.log("hello");
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  const url = req.body.url;

  if (regex.test(url)) {
    // so, 1) query to find max short_url 2) literally result + 1 3) create new record with {original_url: "whatever", short_url: that new one}

    const result = await Url.find({})
      .sort({ short_url: -1 })
      .s.select("short_url")
      .exec();

    console.log("resultsssss", result);

    return res.json(result);

    //     let urlInstance = new Url({ original_url: url});

    //     urlInstance.save((err, doc) => {
    //       if (err) return console.error(err);
    //       console.log("saved ", doc);
    //       res.json(doc);
    //     });
  } else {
    res.json({
      error: "invalid URL"
    });
  }
});

app.get("/api/shorturl/:number", function(req, res) {
  req.params.number;
  // look up the number in database then retrieve the url
  // store the url in variable and then pass it to redirect
  res.redirect();
});

app.get("/testing", async function(req, res) {
  const result = await Url.findOne({ type: "original_url " }).sort(
    "-short_url"
  );

  console.log("resulsssss", result);

  return res.json(result);
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
