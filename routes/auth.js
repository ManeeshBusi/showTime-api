const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      req.body,
      { new: true, upsert: true }
    );
    console.log("User added/updated successfully", user);
    res.status(200).json(user);
  } catch (e) {
    console.log("Error adding/updating user", e);
    res.status(e.code).json(e);
  }
});

router.post("/background/:userId", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { background: req.body.background }
    );
    console.log("user background updated");
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/:userId", async(req, res) => {
  try{
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
  } catch(e){
    console.log("Error fetching user details", e);
    res.status(500).json(e);
  }
})

module.exports = router;
