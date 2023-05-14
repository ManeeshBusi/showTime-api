const { XMLParser } = require("fast-xml-parser");
const fetch = require("node-fetch");
const User = require("../models/User");
const Movie = require("../models/Movie");
const { getColorFromURL } = require("color-thief-node");
const Ticket = require("../models/Ticket");

const getUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw { code: 404, message: "User not found" };
    return user;
  } catch (e) {
    console.log("Error getting user", e);
    throw e;
  }
};

const getLastMovie = async (userId) => {
  try {
    const doc = await Ticket.find({ userId: userId })
      .limit(1)
      .sort({ createdAt: 1 });
    return doc;
  } catch (e) {
    throw e;
  }
};

const getMovieDetails = async (name, date) => {
  var movieId = "";
  let tmdbId = "";

  let movie = await Movie.findOne({ title: name });
  if (movie) {
    console.log("MOVIE IS THERE", name);
  } else {
    let year = date.split(",")[2].trim();

    if (name == "The Whale") {
      year = "2022";
    }

    if (name == "Jujutsu Kaisen 0") {
      year = "2021";
    }

    const res = await fetch(
      process.env.TMDB_URL +
        name.toLowerCase().replace(" ", "%20").replace("&", "%26") +
        `&year=${year}`
    ).then((data) => data.json());

    for (var i = 0; i < res.results.length; i++) {
      if (name == "Beast") {
        tmdbId = res.results[8].id;
        break;
      } else if (name == "Godfather") {
        tmdbId = res.results[4].id;
        break;
      } else {
        console.log("YEAR", year, name);
        tmdbId = res.results[i].id;
        break;
      }
    }

    const movieInfo = await fetch(
      `${process.env.TMDB_MOVIE}${tmdbId}?api_key=${process.env.TMDB_KEY}&language=en-US`
    ).then((res) => res.json());
    const {
      backdrop_path: bg,
      poster_path: img,
      overview: overview,
      genres: genres,
      runtime: runtime,
    } = movieInfo;

    let movieParams = {
      bg: process.env.TMDB_BG + bg,
      img: process.env.TMDB_POSTER + img,
      overview,
      genres,
      runtime,
      title: name,
      tmdbId,
    };

    if (movieInfo.belongs_to_collection) {
      movieParams.series = {
        id: movieInfo.belongs_to_collection.id,
        name: movieInfo.belongs_to_collection.name,
      };
    }

    movieParams.language = movieInfo.spoken_languages
      ? movieInfo.spoken_languages[0].english_name
      : "";

    let domColor = await getColorFromURL(process.env.TMDB_POSTER + img);
    movieParams.color = `rgba(${domColor[0]}, ${domColor[1]}, ${domColor[2]}, 0.96)`;
    const saveMovie = new Movie(movieParams);
    movie = await saveMovie.save();
  }
  movieId = movie._id;
  return movieId;
};

const messageParser = async (payload) => {
  const body = payload.parts[0].parts[1].body.data;

  const bodyText = Buffer.from(body, "base64").toString("ascii");

  const bodyObject = new XMLParser().parse(bodyText);

  const dataTable =
    bodyObject.html.body.table.tr.td.table.tr[3].td.table.tr[0].td.table.tr[0]
      .td.table.tr.td.table.tr.td[1].table;

  const bookingId = bodyObject.html.body.table.tr.td.table.tr[2].td.span;
  var name = dataTable.tr[0].td.span.split("(")[0].trim();
  const timeDate = dataTable.tr[1].td["#text"];
  const time = timeDate.split("|")[0].trim();
  const date = timeDate.split("|")[1].substring(1).trim();
  const theater =
    dataTable.tr[1].td.span.span + " " + dataTable.tr[1].td.span["#text"];
  const screen = theater.split("(")[1].split(")")[0].split(" ")[1];
  const location = theater.split("(")[0];
  const seats = dataTable.tr[2].td.span.split("- ")[1]
    ? dataTable.tr[2].td.span.split("- ")[1]
    : dataTable.tr[2].td.span.split("- ")[0];

  const movieId = await getMovieDetails(name, date);
  return { movieId, bookingId, time, date, screen, location, seats };
};

const deleteTickets = async (userId) => {
  try {
    const res = await Ticket.deleteMany({ userId: userId });
    return res;
  } catch (e) {
    throw e;
  }
};

const timeFormat = (time) => {
  const zone = time.slice(-2);
  if (zone == "pm") {
    let result = time.slice(0, -2);
    const formatted = parseInt(result.split(":")[0]) + 12;
    return `${formatted}:${result.split(":")[1]}`;
  }
  return time.slice(0, -2);
};

module.exports = {
  getUser,
  getMovieDetails,
  getLastMovie,
  messageParser,
  timeFormat,
  deleteTickets,
};
