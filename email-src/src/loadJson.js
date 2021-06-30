const fs = require("fs");
const path = require("path");

module.exports = function loadJson() {
  const data = {};

  const dir = fs.readdirSync(path.join(__dirname, "json"));

  for (let i = 0; i < dir.length; ++i) {
    dir[i] = dir[i].split(".")[0];
    const filePath = path.join(__dirname, "json", dir[i] + ".json");
    data[dir[i]] = fs.readFileSync(filePath, "utf-8");
    data[dir[i]] = JSON.parse(data[dir[i]]);
  }

  return data;
};
