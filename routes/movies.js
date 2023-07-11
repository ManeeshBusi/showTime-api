const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movie");

const PAGE_SIZE = 8;

router.post("/add");

router.get("/lists/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate([
      { path: "watchlist", select: "img tmdbId title bg" },
      { path: "favorite", select: "img tmdbId title bg" },
    ]);
    res.status(200).json({ watchlist: user.watchlist, favorite: user.favorite });
  } catch (e) {
    console.log("Error fetching watchlist", e);
    res.status(500).json(e);
  }
});

router.post("/add/:list/:userId", async (req, res) => {
  try {
    const { userId, list } = req.params;
    const { movieDetails } = req.body;
    const user = await User.findById(userId);
    
    let existingMovie = await Movie.findOneAndUpdate(
      { tmdbId: movieDetails.tmdbId },
      movieDetails,
      { upsert: true, new: true }
    );
    user[list].push(existingMovie._id);
    await user.save();
    
    res.status(200).json({list: [list], type: 'add', movie: existingMovie});
  } catch (e) {
    console.log("Error adding movie to list", e);
    res.status(500).json(e);
  }
});

router.post("/delete/:list/:userId", async (req, res) => {
  try {
    const { userId, list } = req.params;
    const {movieDetails} = req.body;
    const user = await User.findById(userId);

    const movieIndex = user[list].indexOf(movieDetails._id);
    if (movieIndex === -1) {
      return res.status(404).json({ error: "Movie not found in the list" });
    }

    user[list].splice(movieIndex, 1);
    await user.save();

    res.status(200).json({ list: [list], type: 'remove', movie: movieDetails });
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
