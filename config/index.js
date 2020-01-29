const isDev = process.env.BUILD_TYPE && process.env.BUILD_TYPE.trim() === "dev";

const configFileName = isDev ? "config.dev" : "config.prod";
try {
  module.exports = require(`./${configFileName}`);
} catch(err) {
  console.log(`Missing config/${configFileName}.js - copy config/config.sample.js to config/${configFileName}.js and set your configuration`);
  console.log(err);
  process.exit();
}
