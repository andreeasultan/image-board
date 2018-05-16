var spicedPg = require("spiced-pg");
var config = require("./config.json");
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    var { dbUser, dbPass } = require("./secrets.json");
    dbUrl = `postgres:${dbUser}:${dbPass}@localhost:5432/imageboard`;
}

var db = spicedPg(dbUrl);

function getImages() {
    return db.query("SELECT*FROM images ORDER BY created_at DESC LIMIT 3").then(results => {
        let images = results.rows;
        images.forEach(function(image) {
            image.image = config.s3Url + image.image;
        });
        return images;
    });
}

function getMoreImages(id){
    return db.query("SELECT*FROM images WHERE id<$1 ORDER BY created_at DESC LIMIT 3", [id])
        .then(function(results){
            let images = results.rows;
            images.forEach(function(image) {
                image.image = config.s3Url + image.image;
            });
            return images;
        });
}

function uploadImage(image, username, title, description){
    return db.query("INSERT INTO images (image, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [image, username, title, description])
        .then(function(results){
            let images = results.rows;
            images.forEach(function(image) {
                image.image = config.s3Url + image.image;
            });
            return images;
        });
}

function getSelectedImage(id){

    return db.query(`SELECT*FROM images WHERE id=$1`,[id])
        .then(function(results){
            let image = results.rows[0];
            image.image=config.s3Url + image.image;
            return image;
        });
}

function getComment(id){
    return db.query(`SELECT*FROM comments WHERE image_id=$1 ORDER BY created_at DESC`,[id])
        .then(function(results){
            return results.rows;
        });
}

function saveComment(id, comment, username){
    return db.query(`INSERT INTO comments (image_id, comment, username)
     VALUES ($1,$2,$3)
     RETURNING*`, [id,comment,username]).then(function(results){
        return results.rows;
    });
}

module.exports = {
    getImages,
    getMoreImages,
    uploadImage,
    getSelectedImage,
    getComment,
    saveComment
};
