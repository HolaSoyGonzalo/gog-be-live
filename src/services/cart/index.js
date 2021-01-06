const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream");

const { Transform } = require("json2csv");

const router = express.Router();

const cartFilePath = path.join(__dirname, "cart.json");
const gamesFilePath = path.join(__dirname, "..", "games", "games.json");

const readFile = async (path) => {
  const buffer = await fs.readFile(path);
  const text = buffer.toString();
  return JSON.parse(text);
};

const writeFile = async (content) => {
  await fs.writeFile(cartFilePath, JSON.stringify(content));
};

//CSV EXPORT
router.get("/csv/export", async (req, res, next) => {
  //1-Source === cart.json
  const source = fs.createReadStream(cartFilePath);
  //2-Transform === json2csv
  const transformStreamJSONtoCSV = new Transform({
    fields: ["title", "genre", "price", "id"],
  });
  //3-Destination === response.object (stream)
  //Add a special header to permit the "save on disk" window to be opened by the browser
  res.setHeader("Content-Disposition", "attachment; filename=export.csv");
  pipeline(source, transformStreamJSONtoCSV, res, (err) => {
    if (err) {
      next(err);
    }
  });
});

//PDF (NOT WORKING)

// router.post("/checkout", async (req, res, next) => {
//   // Define font files
//   var fonts = {
//     Roboto: {
//       normal: "fonts/Roboto-Regular.ttf",
//       bold: "fonts/Roboto-Medium.ttf",
//       italics: "fonts/Roboto-Italic.ttf",
//       bolditalics: "fonts/Roboto-MediumItalic.ttf",
//     },
//   };

//   var PdfPrinter = require("pdfmake");
//   var printer = new PdfPrinter(fonts);
//   var fs = require("fs");

//   var docDefinition = {
//     // ...
//   };

//   var options = {
//     // ...
//   };

//   var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
//   pdfDoc.pipe(fs.createWriteStream("document.pdf"));
//   pdfDoc.end();
// });

//RETRIEVE
router.get("/", async (req, res, next) => {
  res.send(await readFile(cartFilePath));
});
//ADD
router.post("/:id", async (req, res, next) => {
  try {
    //search for the game into games.json
    const gameList = await readFile(gamesFilePath);
    const game = gameList.find((g) => g.id === req.params.id);
    if (!game) {
      // if !found => 404}
      const error = new Error("Cannot find game " + req.params.id);
      error.httpStatusCode = 404;
      next(error);
    }
    //if found => add it to cart.json
    const currentCart = await readFile(cartFilePath);
    const gameAlreadyInCart = currentCart.find((g) => g.id === req.params.id);
    if (gameAlreadyInCart) {
      const error = new Error("Game Already In The Cart!");
      error.httpStatusCode = 400;
      next(error);
    }

    await writeFile([...currentCart, game]);

    res.status(201).send();
  } catch (e) {
    console.log(e);
    next(e);
  }
});
//REMOVE
router.delete("/:id", async (req, res, next) => {
  //Get All elements from the cart
  const currentCart = await readFile(cartFilePath);
  //Leave specified game out
  const remainingElements = currentCart.filter(
    (game) => game.id !== req.params.id
  );
  if (!remainingElements.length === currentCart.length) {
    // if !found => 404}
    const error = new Error("Cannot find game " + req.params.id);
    error.httpStatusCode = 404;
    next(error);
  }
  //write back the list
  await writeFile(remainingElements);
  res.send(200);
});

module.exports = router;
