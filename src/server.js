const express = require("express");
require("dotenv").config();
const listEndPoints = require("express-list-endpoints");
const router = require("./services/games");

const gamesRouter = require("./services/games");

const server = express();

server.use(express.json());

server.get("/", (req, res, next) =>
  res.send("All good in the hood, server is running!")
);

server.use("/games", gamesRouter);

const port = process.env.PORT || 3001;

console.log(listEndPoints(server));

server.listen(port, () =>
  console.log("Server is running in the '90s on port: " + port)
);
