const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const renderHandlebars = require("./renderHandlebars");
const loadViews = require("./loadViews");
const loadJson = require("./loadJson");

const result = dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});

if (result.error) {
  console.log("Error setting environment variables: %s", result.error);
  process.exit(-1);
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const views = loadViews();
const data = loadJson();

/**
 * for the get request, load json files from disk to fill information
 * the request should be in this form
 * /VIEW_NAME/JSON_FILE_1/JSON_FILE_2/...
 */
app.get("*", async function (req, res) {
  const args = req.url.substring(1).split("/");
  if (args[0] === "") {
    return res.status(200).send(views);
  }

  const view = args.shift();
  const html = await renderHandlebars(view, data);
  res.status(200).send(html);
});

console.log("Listening on http://localhost:%d", process.env.PORT);
app.listen(process.env.PORT);
