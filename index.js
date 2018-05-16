const express = require("express");
const app = express();
const db = require("./db.js");
const bodyParser = require("body-parser");
const s3 = require("./s3.js");

app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.get("/images", (req, res) => {
    db.getImages().then(images => {
        console.log("first images ", images);
        res.json({ images: images });
    });
});


app.get("/more-images/:id", (req,res)=>{
    var lastImageId = req.params.id;
    db.getMoreImages(lastImageId).then(images=>{
        console.log("more images ", images);
        res.json({images:images});
    });

});

app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    console.log("inside POST/upload");
    if (req.file) {
        db.uploadImage(req.file.filename, req.body.username, req.body.title, req.body.description)
            .then(results => {
                console.log("logg upload results", results);
                res.json({results:results[0]});
            });
    } else {
        console.log("upload did not work");
        res.json({
            success: false
        });
    }
});

app.get("/single-image/:id", (req,res) => {
    var imageId=req.params.id;
    db.getSelectedImage(imageId).then(results => {
        console.log("selected image results", results);
        db.getComment(imageId).then(data => {
            res.json({
                image: results,
                comments: data,
                success: true
            });
        });
    }).catch(()=>{
        res.json({success:false});
    });

});

app.post("/comment/:id", (req,res)=>{
    var imageId=req.params.id;
    console.log(req.body);
    db.saveComment(imageId,req.body.comment, req.body.username)
        .then(results=>{
            console.log("inside app.post/comment", results);
            res.json({results:results[0]});
        });
});



app.listen(8080, () => console.log("I am listening"));
