const express = require("express");
const path = require("path");
const router = express.Router();

const cartFilePath = path.join(__dirname, "cart.json");

const readFile = async (path) => {
  const buffer = await fs.readFile(path);
  const text = buffer.toString();
  return JSON.parse(text);
};

const writeFile = async (content) => {
  await fs.writeFile(gamesFilePath, JSON.stringify(content));
};

//Retrieve
//Add
//Remove

module.exports = router;
