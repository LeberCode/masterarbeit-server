const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  emptyCustomCodeDatabase,
  clearDocker,
} = require("./src/functions/helperFunctions");

const customCodeRouter = require("./src/routes/customCodeRouter");
const deployRouter = require("./src/routes/deployRouter");

const server = express();
const PORT = 3001;

server.use(cors());
server.use(bodyParser.json());
server.use("/customCode", customCodeRouter);
server.use("/deploy", deployRouter);

server.get("/", (req, res) => {
  res.send("Hello World");
});

emptyCustomCodeDatabase();
// clearDocker();

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
