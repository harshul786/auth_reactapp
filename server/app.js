const express = require("express");
const app = express();
const auth = require("./middleware/auth");
require("dotenv");

app.use(express.json());
require("./mongoose/index").connect();
const User = require("./models/users");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/signup", (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  user
    .save()
    .then(async function () {
      const token = await user.generateAuthToken();
      res.send({ user: user.getPublicObject(), token });
    })
    .catch((err) => res.send(err));
});

app.post("/signin", async function (req, res) {
  try {
    const user = await User.authenticateByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.send({ user: user.getPublicObject(), token });
  } catch (err) {
    res.status(400).send();
  }
});

app.get("/user-profile", auth, async (req, res) => {
  const publicObject = req.user.getPublicObject();
  res.send(publicObject);
});

app.post("/signout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });

    await req.user.save();
    res.send("Signed Out!");
  } catch (e) {
    res.status(500).send();
  }
});

app.post("/signout-all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Signed Out!");
  } catch (e) {
    res.status(500).send();
  }
});

app.delete("/user-profile", auth, async (req, res) => {
  try {
    await User.deleteOne({ _id: req.user._id });
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log("server running on port 3001");
});
