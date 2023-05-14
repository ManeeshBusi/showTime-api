const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    location: { type: String },
    date: { type: String },
    time: { type: String },
    seats: { type: String },
    screen: { type: String },
    datetime: { type: String },
    bookingId: {type: String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
