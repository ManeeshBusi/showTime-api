const express = require("express");
const Ticket = require("../models/Ticket");
const { getMovieDetails } = require("../utils/controller");
const router = express.Router();
const moment = require("moment/moment");

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const tickets = await Ticket.find({ userId })
      .populate("movieId")
      .sort({ datetime: -1 });
    res.status(200).json(tickets);
  } catch (e) {
    console.log("Error getting tickets", e);
    res.status(500).json(e);
  }
});

router.post("/add/:userId", async (req, res) => {
  const { userId } = req.params;
  const { title, date, time, location, screen, seats } = req.body;
  try {
    const movieId = await getMovieDetails(title);
    const datetime = moment(date).unix();
    const ticketDetails = {
      date,
      time,
      location,
      screen,
      seats,
      movieId,
      userId,
      datetime,
    };

    const savedTicket = await new Ticket(ticketDetails).save();
    const populatedTicket = await Ticket.find({
      _id: savedTicket._id,
    }).populate("movieId");
    res.status(200).json(populatedTicket);
  } catch (e) {
    console.log("Error adding ticket", e);
    res.status(500).json(e);
  }
});

router.post("/change/:ticketId", async (req, res) => {
  const { ticketId } = req.params;
  const { title, tmdbId } = req.body;

  try {
    const movieId = await getMovieDetails(title, tmdbId);
    await Ticket.findByIdAndUpdate(ticketId, {movieId: movieId});
    const populatedTicket = await Ticket.findById(ticketId).populate("movieId");
    res.status(200).json(populatedTicket);
  } catch (e) {
    console.log("Error updating ticket", e);
    res.status(500).json(e);
  }
});

module.exports = router;
