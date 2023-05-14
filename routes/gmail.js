const express = require("express");
const router = express.Router();
const {
  getUser,
  messageParser,
  getLastMovie,
  timeFormat,
  deleteTickets,
} = require("../utils/controller");
const { google } = require("googleapis");
const { oAuth2Client } = require("../config/oauth2Client");
const Ticket = require("../models/Ticket");
const moment = require("moment/moment");

router.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await getUser(userId);
    const deleteExistingTickets = await deleteTickets(userId);
    oAuth2Client.setCredentials({ access_token: user.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      q: "from:BookMyShow subject:Your Tickets",
    });

    const messages = response.data.messages;
    var ticketsList = [];
    for (var i = 0; i < messages.length - 25; i++) {
      const messageData = await gmail.users.messages.get({
        userId: "me",
        id: messages[i].id,
      });

      const subject = messageData.data.payload.headers.find(
        (header) => header.name == "Subject"
      )?.value;

      if (subject == "Your Tickets") {
        const messageParsed = await messageParser(messageData.data.payload);
        const size = ticketsList.length;
        let existingTicket = await Ticket.findOne({
          movieId: messageParsed.movieId,
          userId: userId,
          date: messageParsed.date,
          // location: messageParsed.location,
        });
        if (existingTicket) {
          if (existingTicket.location == messageParsed.location) {
            existingTicket.seats =
              existingTicket.seats + ", " + messageParsed.seats;
            await existingTicket.save();
          }
        } else {
          await Ticket.create({
            ...messageParsed,
            userId,
            datetime: moment(messageParsed.date).unix(),
          });
        }
      }
    }
    res.status(200).json({ message: "All tickets have been updated" });
  } catch (e) {
    console.log("Error getting access token", e);
    res.status(500).json(e);
  }
});

router.get("/latest/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await getUser(userId);
    const movie = await getLastMovie(userId);
    const time = timeFormat(movie[0].time);
    const datetime = moment(`${movie[0].date} ${time}`).unix();

    oAuth2Client.setCredentials({ access_token: user.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      q: `from:BookMyShow subject:Your Tickets after:${datetime}`,
    });

    const messages = response.data.messages;
    if (messages) {
      for (var i = 0; i < messages.length; i++) {
        const messageData = await gmail.users.messages.get({
          userId: "me",
          id: messages[i].id,
        });

        const subject = messageData.data.payload.headers.find(
          (header) => header.name == "Subject"
        )?.value;

        if (subject == "Your Tickets") {
          const messageParsed = await messageParser(messageData.data.payload);
          let existingTicket = await Ticket.findOne({
            movieId: messageParsed.movieId,
            userId: userId,
            date: messageParsed.date,
            location: messageParsed.location,
          });
          if (existingTicket) {
            existingTicket.seats =
              existingTicket.seats + ", " + messageParsed.seats;
            await existingTicket.save();
          } else {
            await Ticket.create({ ...messageParsed, userId });
          }
        }
      }
      res.status(200).json({ message: "All tickets have been updated" });
    } else {
      res.status(200).json({ message: "No new tickets" });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(500).json(e);
  }
});

module.exports = router;
