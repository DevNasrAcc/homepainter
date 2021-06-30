const fs = require("fs");
const path = require("path");

module.exports = function loadJson() {
  let data = "";

  const dir = fs.readdirSync(path.join(__dirname, "views"));

  for (let i = 0; i < dir.length; ++i) {
    if (fs.lstatSync(path.join(__dirname, "views", dir[i])).isDirectory())
      continue;

    dir[i] = dir[i].split(".")[0];
    data += `<a href="/${dir[i]}">${dir[i]}</a><br>`;
  }

  return data;
};
