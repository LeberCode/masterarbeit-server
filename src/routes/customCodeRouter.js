const express = require("express");
const { addCustomCodeToJson } = require("../functions/helperFunctions");
const customCodeRouter = express.Router();

customCodeRouter.post("/", async (req, res) => {
  try {
    addCustomCodeToJson(req.body);
    res.status(200).json({ message: "Custom Code erfolgreich hinzugefügt" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Es ist etwas schief gelaufen!" });
  }
});

module.exports = customCodeRouter;
