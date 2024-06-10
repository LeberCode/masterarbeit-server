const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");

const { emptyCustomCodeDatabase } = require("./src/functions/helperFunctions");
const { startRabbitmq, dockerCleanUp } = require("./src/docker/dockerManager");

const customCodeRouter = require("./src/routes/customCodeRouter");
const deployRouter = require("./src/routes/deployRouter");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use("/customCode", customCodeRouter);
app.use("/deployment", deployRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

emptyCustomCodeDatabase();
// clearDocker();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startRabbitmq();
});

process.on("SIGINT", () => {
  console.log("SIGINT empfangen. Server wird beendet...");
  dockerCleanUp();

  server.close(() => {
    console.log("HTTP-Server geschlossen");
    process.exit(0);
  });
});
