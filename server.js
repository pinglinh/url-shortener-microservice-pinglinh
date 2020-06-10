"use strict";

require("dotenv").config();
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var cors = require("cors");
var dns = require("dns");
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

const AutoIncrement = require("mongoose-sequence")(mongoose);

/** this project needs a db !! **/
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: Number,
});

const Url = mongoose.model("Url", urlSchema);

app.post("/api/shorturl/new", async function (req, res) {
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  const url = req.body.url;

  if (regex.test(url)) {
    // so, 1) query to find max short_url 2) literally result + 1 3) create new record with {original_url: "whatever", short_url: that new one}

    const result = await Url.find({})
      .sort({ short_url: -1 })
      .select("short_url")
      .exec();

    const maxNum = result[0].short_url;

    let urlInstance = new Url({ original_url: url, short_url: maxNum + 1 });

    const newRecord = await urlInstance.save();

    console.log(newRecord);

    res.json({
      original_url: newRecord.original_url,
      short_url: newRecord.short_url,
    });
  } else {
    res.json({
      error: "invalid URL",
    });
  }
});

app.get("/api/shorturl/:number", async function (req, res) {
  const shortUrl = req.params.number;

  const originalUrl = await Url.findOne({ short_url: shortUrl });

  res.redirect(originalUrl.original_url);
});

app.listen(port, function () {
  console.log("Node.js listening ...");
});
