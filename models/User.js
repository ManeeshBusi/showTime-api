const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  picture: { type: String },
  accessToken: { type: String },
  background: { type: String },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
  favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

module.exports = mongoose.model("User", userSchema);
