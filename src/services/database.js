const Blogposts = require("../models/blogposts");

const allPosts = () =>
  Blogposts.aggregate([
    {
      $project: {
        author: 1,
        date: 1,
        dateString: {
          $dateFromString: {
            dateString: "$date"
          }
        },
        id: 1,
        imagelink: 1,
        title: 1
      }
    },
    { $sort: { dateString: -1 } }
  ]).then(posts => posts);

const latestPost = () => allPosts().then(result => result[0]);

const singlePost = id => Blogposts.findOne({ id }).then(result => result);

const newPost = convertedPost => {
  try {
    const createPost = Blogposts.create(convertedPost);
    return createPost;
  } catch (err) {
    // console.log(err);
  }
};

module.exports = { allPosts, singlePost, newPost, latestPost };
