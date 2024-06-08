const express = require("express");
const {
  deployArchitecture,
  stopArchitecture,
  restartArchitecture,
} = require("../functions/helperFunctions");

const deployRouter = express.Router();

deployRouter.post("/run", async (req, res) => {
  try {
    deployArchitecture();
    res.status(200).json({ message: "Deployment erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Deployment fehlgeschlagen!" });
  }
});

deployRouter.post("/stop", async (req, res) => {
  try {
    stopArchitecture();
    res.status(200).json({ message: "Stop erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Stop fehlgeschlagen!" });
  }
});

deployRouter.post("/restart", async (req, res) => {
  try {
    restartArchitecture();
    res.status(200).json({ message: "Stop erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Stop fehlgeschlagen!" });
  }
});

module.exports = deployRouter;
