const {} = require("package");
const {} = require("~/root");
const {} = require("~/nested");
const {} = require("~/nested/nested-path");
const {} = require("~/nested/non-existent");
const {} = require("@/non-existent");
const {} = require("~/data.json");
const {} = require("~/non-existent.json");

const {
  multi1,
  multi2,
  multi3,
  multi4,
  multi5,
  multi6,
  multi7,
  multi8,
} = require("~/multiline");

// Module code
function sample() {}
module.exports = { sample };
