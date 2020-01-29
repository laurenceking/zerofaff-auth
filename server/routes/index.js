const express = require("express");
const router = express.Router();

const processPost = (req, res, callback) => {
  let body = [];
  req
    .on("data", chunk => {
      body.push(chunk);
    })
    .on("end", async () => {
      body = Buffer.concat(body).toString();
      if (body.length) {
        const { status = 200, ...response } = await callback(JSON.parse(body));
        res.status(status).json(response);
      } else {
        res.status(500).json({ success: false, message: "No data sent" });
      }
    });
};

router.get("/", (req, res) => {
  res.render(`${__dirname}/../views/index.html`);
});

const activate = require("./activate");
const change = require("./change");
const recover = require("./recover");
const login = require("./login");
const signup = require("./signup");
const validation = require("./validation");

router.post("/activate", (req, res) => processPost(req, res, activate.token));
router.post("/activate/resend", (req, res) =>
  processPost(req, res, activate.resend)
);
router.post("/recover/send", (req, res) => processPost(req, res, recover.send));
router.post("/change/password", (req, res) =>
  processPost(req, res, change.password)
);
router.post("/recover", (req, res) => processPost(req, res, recover.reset));
router.post("/login", (req, res) => processPost(req, res, login));
router.post("/signup", (req, res) => processPost(req, res, signup));
router.post("/check/email", (req, res) =>
  processPost(req, res, validation.usernameOrEmail)
);
router.post("/check/username", (req, res) =>
  processPost(req, res, validation.usernameOrEmail)
);
router.post("/check/token", (req, res) =>
  processPost(req, res, validation.token)
);

module.exports = router;
