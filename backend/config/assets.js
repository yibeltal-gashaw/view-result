const path = require("path");

const rootDir = path.join(__dirname, "..");

module.exports = {
  femaleImagePath: path.join(rootDir, "public", "female.png"),
  imagePath: path.join(rootDir, "public", "img.png"),
  maleImagePath: path.join(rootDir, "public", "male.png"),
  webAppUrl: process.env.WEB_APP_URL?.trim(),
};
