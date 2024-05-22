const express = require("express");
const { deployArchitecture } = require("../functions/helperFunctions");

const deployRouter = express.Router();

deployRouter.post("/", async (req, res) => {
  try {
    deployArchitecture();
    res.status(200).json({ message: "Deployment erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Deployment fehlgeschlagen!" });
  }
});

module.exports = deployRouter;
