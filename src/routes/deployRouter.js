const express = require("express");
const {
  deployArchitecture,
  stopArchitecture,
  restartArchitecture,
} = require("../functions/helperFunctions");
const { dockerCleanUp } = require("../docker/dockerManager");

const deployRouter = express.Router();

deployRouter.post("/run", async (req, res) => {
  try {
    await deployArchitecture();
    res.status(200).json({ message: "Deployment erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Deployment fehlgeschlagen!" });
  }
});

deployRouter.post("/stop", async (req, res) => {
  try {
    await stopArchitecture();
    res.status(200).json({ message: "Stop erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Stop fehlgeschlagen!" });
  }
});

deployRouter.post("/restart", async (req, res) => {
  try {
    await restartArchitecture();
    res.status(200).json({ message: "Stop erfolgreich!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Stop fehlgeschlagen!" });
  }
});

deployRouter.get("/clearDocker", async (rey, res) => {
  try {
    await dockerCleanUp();
    res.status(200).json({ message: "Docker leeren erfoglreich" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Docker leeren fehlgeschlagen" });
  }
});

module.exports = deployRouter;
