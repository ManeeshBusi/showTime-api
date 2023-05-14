const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: String },
    title: { type: String },
    overview: {type: String},
    genres: [{id: String, name: String}],
    runtime: {type: Number},
    bg: { type: String },
    img: { type: String },
    color: { type: String },
    series: {type: Object},
    language: {type: String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
