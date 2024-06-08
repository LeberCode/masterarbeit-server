const fs = require("fs").promises;
const path = require("path");
const {
  buildDockerImage,
  runDockerContainer,
  pauseDockerContainer,
  unpauseDockerContainer,
} = require("../docker/dockerManager");

const fillDockerJS = async (code) => {
  const filePath = path.resolve(__dirname, "../../docker.js");

  try {
    await fs.appendFile(filePath, code);
    console.log("docker.js erfolgreich befüllt");
    return Promise.resolve();
  } catch (err) {
    console.error("Fehler beim Hinzufügen des Codes zu docker.js: ", err);
    throw err;
  }
};

const emptyDockerJS = async () => {
  const filePath = path.resolve(__dirname, "../../docker.js");

  try {
    await fs.writeFile(filePath, ""); // Überschreibe den Inhalt der Datei mit einem leeren String
    console.log("docker.js erfolgreich geleert");
  } catch (err) {
    console.error("Fehler beim Leeren der docker.js:", err);
    throw err;
  }
};

const emptyCustomCodeDatabase = async () => {
  const filePath = path.resolve(__dirname, "../../customCodeDatabase.json");

  try {
    await fs.writeFile(filePath, "[]"); // Überschreibe den Inhalt der Datei mit einem leeren Array
    console.log("customCodeDatabase.json erfolgreich geleert");
  } catch (err) {
    console.error("Fehler beim Leeren der customCodeDatabase.json:", err);
    throw err;
  }
};

const addCustomCodeToJson = async (newElement) => {
  const dataFilePath = path.resolve(__dirname, "../../customCodeDatabase.json");

  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    let jsonArray;
    jsonArray = JSON.parse(data);
    const existingFilter = jsonArray.find(
      (element) => element.id === newElement.id
    );
    if (existingFilter) {
      existingFilter.code = newElement.code;
    } else {
      jsonArray.push(newElement);
    }

    await fs.writeFile(
      dataFilePath,
      JSON.stringify(jsonArray, null, 2),
      "utf8"
    );
    console.log("Neues Element erfolgreich hinzugefügt.");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getCustomCodes = async () => {
  const dataFilePath = path.resolve(__dirname, "../../customCodeDatabase.json");

  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    const jsonData = await JSON.parse(data);
    return jsonData;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let HOSTPORT = 9090;
let CONTAINERPORT = 9090;

const deployArchitecture = async () => {
  const customCodes = await getCustomCodes();
  for (const customCode of customCodes) {
    await fillDockerJS(customCode.code);
    const filePath = path.join(__dirname, "../../");
    const dockerImageName = customCode.id;
    const dockerContainerName = customCode.id;
    await buildDockerImage(filePath, dockerImageName);
    await runDockerContainer(
      dockerImageName,
      dockerContainerName,
      HOSTPORT,
      CONTAINERPORT
    );
    await emptyDockerJS();
    HOSTPORT++;
    CONTAINERPORT++;
  }
};

const stopArchitecture = async () => {
  const customCodes = await getCustomCodes();
  for (const customCode of customCodes) {
    await pauseDockerContainer(customCode.id);
  }
};

const restartArchitecture = async () => {
  const customCodes = await getCustomCodes();
  for (const customCode of customCodes) {
    await unpauseDockerContainer(customCode.id);
  }
};

const clearDocker = () => {
  // Docker Container
  // Docker Files
  // Docker Network
};

module.exports = {
  emptyDockerJS,
  fillDockerJS,
  emptyCustomCodeDatabase,
  addCustomCodeToJson,
  getCustomCodes,
  deployArchitecture,
  clearDocker,
  stopArchitecture,
  restartArchitecture,
};
