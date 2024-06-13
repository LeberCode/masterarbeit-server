const express = require("express");
const {
  deployArchitecture,
  stopArchitecture,
  restartArchitecture,
  clearArchitecture,
  scaleOut,
  scalingCounter,
} = require("../functions/helperFunctions");

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

deployRouter.get("/clearArchitecture", async (req, res) => {
  try {
    await clearArchitecture();
    res.status(200).json({ message: "Docker leeren erfoglreich" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Docker leeren fehlgeschlagen" });
  }
});

deployRouter.post("/scaleOut", async (req, res) => {
  try {
    const { id } = req.body;
    await scaleOut(id);
    res.status(200).json({ message: "Scale Out erfolgreich" });
  } catch (e) {
    console.error(e);
    if (e.name === "CustomError") {
      res.status(500).json({ message: e.message });
    } else {
      res.status(500).json({ message: "Scale Out fehlgeschlagen" });
    }
  }
});

deployRouter.get("/scaleValues", async (req, res) => {
  try {
    const result = await scalingCounter();
    res.status(200).json({ result, message: "Scale Values erfolgreich" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Scale Values fehlgeschlagen" });
  }
});

module.exports = deployRouter;
