const express = require("express");
const uuidv4 = require("uuid/v4");
const moment = require("moment");
const converter = require("../services/converter");
const database = require("../services/database");

const router = express.Router();

router.route("/blogs").get((req, res) => {
  database.allPosts().then(blogs => res.render("blogs", { blogs }));
});

router
  .route("/blogs/create")
  .get((req, res) => res.render("blogform"))
  .post((req, res) => {
    database
      .newPost({
        id: uuidv4(),
        title: req.body.title,
        date: moment().format("DD.MM.YYYY"),
        author: req.body.author,
        content: converter.convertPost(req.body.content),
        imagelink: "/img/blogs/Platzhalter.jpg"
      })
      .then(newBlogpost => {
        res.setHeader("Content-Type", "application/json");
        res.json(newBlogpost);
      });
    res.redirect("/blogs");
  });

router.route("/blogs/:id").get((req, res) => {
  database.singlePost(req.params.id).then(post => res.render("blogs", post));
});

module.exports = router;
