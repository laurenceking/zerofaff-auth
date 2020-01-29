const cors = require("cors");
const logger = require("./helpers/logger");

const config = require("../../config");

["unhandledRejection", "uncaughtException"].forEach(event => {
  process.on(event, err => {
    logger.error(err);
    console.error({
      name: `${event}: ${err.name}`,
      message: err.message,
      stack: err.stack
    });
    process.exit(1);
  });
});

const express = require("express");
const webpack = require("webpack");
const ejs = require("ejs");

const app = express();
app.use(cors());

if (process.env.BUILD_TYPE) {
  const webpackMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  const webpackConfig = require("../webpack.config.js");

  const compiler = webpack(webpackConfig);

  app.use(
    webpackMiddleware(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    })
  );

  app.use(
    webpackHotMiddleware(compiler, {
      log: console.log,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000
    })
  );
}

app.use(express.static(`${__dirname}/../public`));

app.engine(".html", ejs.__express);
app.set("view engine", "ejs");

const index = require("./routes/index");
app.use("/", index);

const port = config.api.port;
const hostname = ;

app.listen(config.api.port, config.api.host, err => {
  if (err) {
    logger.info(err);
    return;
  }
  console.log(`Server running at ${config.api.host}:${config.api.port}`);
});
