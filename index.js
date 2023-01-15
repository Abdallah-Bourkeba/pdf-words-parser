const fs = require("fs");
const { join } = require("path");
const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const mongoose = require("mongoose");

require("dotenv").config({ path: "./config.env" });

const app = express();

mongoose.set("strictQuery", true);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

// Create a Mongoose schema for the unknown words
const UnknownWordSchema = new mongoose.Schema({
  words: {
    type: Array,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  pdf: {
    name: String,
    date: {
      type: Date,
      default: Date.now(),
    },
  },
});

// Create a Mongoose model for the unknown words
const UnknownWord = mongoose.model("UnknownWord", UnknownWordSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", join(__dirname, "/client"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// configure the multer middleware for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // only accept pdf files
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  fileFilter: fileFilter,
});

// handle errors
app.use((error, req, res, next) => {
  if (error) return res.status(400).json({ message: error.message });
  next();
});

app.get("/", (req, res) => {
  res.render("./index");
});

app.get("/upload", (req, res) => {
  res.render("./upload");
});

app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  try {
    // extract the text from the pdf file
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(pdfBuffer);
    // split the text into an array of words
    const words = pdfData.text.split(/\s+/);
    // remove repeated words
    const allWords = [...new Set(words)];
    const preparedWords = [];
    // Format the words
    for (let i = 0; i < allWords.length; i++) {
      let pWord = allWords[i].replace(/[^a-zA-Z\s]/g, "").replace(/[1-9]/g, "");
      if (pWord.length >= 1) {
        preparedWords.push(pWord);
      }
    }
    // respond with the unknown words
    res.status(200).json({ preparedWords });
    // Delete the pdf form the server
    fs.unlinkSync(req.file.path);
  } catch (error) {
    // handle errors
    res.status(500).json({ message: "Error processing the pdf file" });
    console.error(error);
  }
});

app.get("/words/:name", async (req, res) => {
  try {
    const words = await UnknownWord.find({ user: req.params.name });
    res.render("./words", { words: JSON.stringify(words) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting the words" });
  }
});

app.post("/save", async (req, res) => {
  try {
    const { unknownWordsArr, pdfName, userName } = req.body;
    if (!unknownWordsArr || !pdfName || !userName) {
      throw new Error("Missing required fields");
    }
    // Check if the document already exists in the database
    const existingDocument = await UnknownWord.findOne({
      "pdf.name": pdfName,
      user: userName,
    });
    if (!existingDocument) {
      // If the document does not exist, create a new one
      await UnknownWord.create({
        words: unknownWordsArr,
        pdf: { name: pdfName },
        user: userName,
      });
    } else {
      // If the document already exists, update it
      await UnknownWord.updateOne(
        { _id: existingDocument._id },
        { $set: { words: unknownWordsArr } }
      );
    }
    res.status(200).json({ message: "Words saved successfully..." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving words" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
