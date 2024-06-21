const express = require("express");
const {
  addCustomCodeToJson,
  emptyCustomCodeDatabase,
} = require("../functions/helperFunctions");
const customCodeRouter = express.Router();

customCodeRouter.post("/", async (req, res) => {
  try {
    addCustomCodeToJson(req.body);
    res.status(200).json({ message: "Custom Code erfolgreich hinzugefügt!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Es ist etwas schief gelaufen!" });
  }
});

customCodeRouter.get("/clear", async (req, res) => {
  try {
    emptyCustomCodeDatabase();
    res.status(200).json({ message: "Custom Code JSON erfolgreich geleert!" });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Custom Code JSON leeren fehlgeschlagen!" });
  }
});

module.exports = customCodeRouter;
