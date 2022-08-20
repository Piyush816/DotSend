require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcrypt");
const File = require("./models/File");

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// connecting to db
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err.message));

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// multer config
const upload = multer({
  dest: "uploads",
  limits: { fileSize: MAX_FILE_SIZE },
});

// view engine
app.set("view engine", "ejs");

// routes
app.get("/", (req, res) => {
  return res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    filename: req.file.filename,
    path: req.file.path,
    originalName: req.file.originalname,
  };

  if (req.body.password != null && req.body.password != "") {
    // hashing password
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }
  //   saving file
  const file = await File.create(fileData);
  //   creating file link
  const fileLink = `${req.headers.origin}/download/${file.id}`;
  return res.status(201).json({ fileLink });
});

const handleDownload = async (req, res) => {
  const id = req.params.id;

  try {
    const file = await File.findById(id);
    //   file has password
    if (file.password) {
      // get request
      if (req.body.password === undefined || req.body.password === "") {
        return res.render("password");
      }

      // post request
      if (!(await bcrypt.compare(req.body.password, file.password))) {
        return res.render("password", { error: "incorrect password" });
      }
    }

    file.downloadCount += 1;
    await file.save();

    return res.download(file.path, file.originalName);
  } catch (err) {
    return res.render("404");
  }
};

app.route("/download/:id").get(handleDownload).post(handleDownload);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
