require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/blogDB", { useNewUrlParser: true });

const postSchema = {
    title: String,
    content: String,
    coverImg: String,
    previewText: String,
};

const Post = mongoose.model("Post", postSchema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let numOfPosts = 10;

app.get("/", function (req, res) {
    Post.find({}, function (err, posts) {
        res.render("home", {
            posts: posts,
            numberOfPosts: numOfPosts,
        });
    });
});

app.get("/compose", function (req, res) {
    res.render("compose");
});

app.post("/compose", function (req, res) {
    if (req.body.password == process.env.COMPOSE_PASSWORD) {
        const post = new Post({
            title: req.body.postTitle,
            content: req.body.postBody,
            coverImg: req.body.coverimg,
            previewText: req.body.postPreview,
        });

        post.save(function (err) {
            if (!err) {
                res.redirect("/");
            }
        });
    } else {
        res.redirect("/compose");
    }
});

app.get("/delete", function (req, res) {
    res.render("delete");
});

app.post("/delete", function (req, res) {
    const _password = req.body.password;
    const _id = req.body.id;

    if (process.env.DELETE_PASSWORD == _password) {
        Post.findByIdAndDelete(_id, function (err, post) {
            if (err) {
                return;
            } else {
                res.redirect("/");
            }
        });
    } else {
        console.log("wrong password.");
        res.redirect("/delete");
    }
});

app.get("/posts/:postId", function (req, res) {
    const requestedPostId = req.params.postId;
    console.log(requestedPostId);

    Post.findOne({ _id: req.params.postId }, function (err, post) {
        if (err) {
            // post is undefined
            post = { title: "not found", content: "" };
        }
        res.render("post", { post: post });
    });
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
