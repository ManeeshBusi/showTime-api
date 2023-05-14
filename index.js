const express = require("express");
const { google } = require("googleapis");
const { XMLParser } = require("fast-xml-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const fetch = require("node-fetch");
const { getColorFromURL } = require("color-thief-node");

const authRoute = require("./routes/auth");
const gmailRoute = require("./routes/gmail");
const ticketRoute = require("./routes/tickets");
const movieRoute = require("./routes/movies");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

dotenv.config();

mongoose
  .connect(
    "mongodb+srv://maneeshbusi:OBGFabIKLswXFb5g@freem0cluster.xyx3sd0.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((e) => {
    console.log("DB ERROR", e);
  });

// ROUTES
app.use("/auth", authRoute);
app.use("/gmail", gmailRoute);
app.use("/tickets", ticketRoute);
app.use("/movies", movieRoute);

app.listen(process.env.PORT, () => {
  console.log(`SERVER RUNNING on ${process.env.PORT}`);
});
