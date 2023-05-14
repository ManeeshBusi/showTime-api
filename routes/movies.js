const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movie");

const PAGE_SIZE = 8;

router.post("/add");

router.get("/watchlist/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate("watchlist");
    res.status(200).json({ watchlist: user.watchlist });
  } catch (e) {
    console.log("Error fetching watchlist", e);
    res.status(500).json(e);
  }
});

router.get("/favorite/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate("favorite");
    res.status(200).json({ favorite: user.favorite });
  } catch (e) {
    console.log("Error fetching favorite", e);
    res.status(500).json(e);
  }
});

router.post("/add/:list/:userId", async (req, res) => {
  const { userId, list } = req.params;
  const movie = req.body.movieId;
  let movieId = movie._id ?? "";
  try {
    const user = await User.findById(userId);
    let existingMovie = await Movie.findOne({ title: movie.title });
    if (existingMovie) {
      movieId = existingMovie._id;
    } else {
      existingMovie = await new Movie(movie).save();
      movieId = existingMovie._id;
    }
    user[list].push(movieId);
    await user.save();
    res.status(200).json({ movie: existingMovie });
  } catch (e) {
    console.log("Error adding movie to list", e);
    res.status(500).json(e);
  }
});

router.post("/delete/:list/:userId", async (req, res) => {
  const { userId, list } = req.params;
  const movie = req.body.movieId;
  let movieId = movie._id ?? "";
  try {
    const user = await User.findById(userId);
    let existingMovie = await Movie.findOne({ title: movie.title });
    if (existingMovie) {
      movieId = existingMovie._id;
    } else {
      existingMovie = await new Movie(movie).save();
      movieId = existingMovie._id;
    }
    await user[list].pull(movieId);
    await user.save();
    res.status(200).json({ movie: existingMovie });
  } catch (e) {
    console.log("Error deleting movie from list", e);
    res.status(500).json(e);
  }
});

router.get("/backgrounds/:pageNumber", async (req, res) => {
  try {
    const skipCount = (req.params.pageNumber - 1) * PAGE_SIZE;
    const results = await Movie.find({}, "bg").skip(skipCount).limit(PAGE_SIZE);

    res.status(200).json(results);
  } catch (e) {
    console.log("Error with backgrounds", e);
    res.status(500).json(e);
  }
});

module.exports = router;
