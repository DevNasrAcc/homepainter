const fs = require("fs");
const path = require("path");
const exphbs = require("express-handlebars");
const inlineCss = require("inline-css");
const materializeCss = fs.readFileSync(
  path.join(
    __dirname,
    "../node_modules/materialize-css/dist/css/materialize.min.css"
  ),
  "utf-8"
);
const constants = require("../../server-src/src/config/constants");
const helpers = require("../../server-src/src/helpers/helpers");

const hbs = exphbs.create({
  extname: ".hbs",
  partialsDir: path.join(__dirname, "views/partials"),
  layoutsDir: path.join(__dirname, "views/layouts"),
  helpers: {
    storageName2DisplayName: helpers.StorageName2DisplayName,
    formatList: helpers.FormatList,
    formatCurrency: helpers.FormatCurrency,
    formatPercent: helpers.FormatPercent,
    formatDate: helpers.FormatDate,
    subtract: function (minuend, ...subtrahends) {
      subtrahends.pop(); // remove metadata object
      return subtrahends.reduce((l, r) => l - r, minuend);
    },
    if_eq: function (a, b, opts) {
      if (a === b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    },
    if_not_eq: function (a, b, opts) {
      if (a === b) {
        return opts.inverse(this);
      } else {
        return opts.fn(this);
      }
    },
    eq: (a, b) => a === b,
    url: () =>
      process.env.BASE_URL || "http://localhost:" + (process.env.PORT || 80),
  },
});

module.exports = async function render(viewName, data) {
  if (viewName.includes(".")) return "";

  const html = await new Promise((res, rej) => {
    const view = path.join(__dirname, "views", viewName + ".hbs");
    hbs.renderView(view, data, function (err, body) {
      err ? rej(err) : res(body);
    });
  });

  return await inlineCss(html, {
    url: "https://thehomepainter.com",
    extraCss: materializeCss,
  });
};
