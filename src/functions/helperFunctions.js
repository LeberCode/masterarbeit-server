const fs = require("fs").promises;
const path = require("path");
const {
  buildDockerImage,
  runDockerContainer,
  pauseDockerContainer,
  unpauseDockerContainer,
  removeDockerContainer,
  removeDockerImage,
  killDockerContainer,
} = require("../docker/dockerManager");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("./errors.js");

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
    const customCodes = await getCustomCodes();
    const existingFilter = customCodes.find(
      (element) => element.id === newElement.id
    );
    if (existingFilter && existingFilter.isDeployed) {
      await killDockerContainer(newElement.id);
      await removeDockerContainer(newElement.id);
      await removeDockerImage(newElement.id);
      existingFilter.code = newElement.code;
      existingFilter.isDeployed = false;
      existingFilter.isPaused = false;
    } else if (existingFilter && !existingFilter.isDeployed) {
      existingFilter.code = newElement.code;
    } else {
      customCodes.push(newElement);
    }

    await fs.writeFile(
      dataFilePath,
      JSON.stringify(customCodes, null, 2),
      "utf8"
    );
    console.log("Neues Element erfolgreich hinzugefügt.");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const setIsDeployed = async (id) => {
  const dataFilePath = path.resolve(__dirname, "../../customCodeDatabase.json");
  try {
    const customCodes = await getCustomCodes();
    let elementToChange = customCodes.find((element) => element.id === id);
    elementToChange.isDeployed = true;
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(customCodes, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error(err);
  }
};
const setIsPaused = async (id) => {
  const dataFilePath = path.resolve(__dirname, "../../customCodeDatabase.json");
  try {
    const customCodes = await getCustomCodes();
    let elementToChange = customCodes.find((element) => element.id === id);
    elementToChange.isPaused = !elementToChange.isPaused;
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(customCodes, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error(err);
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
    if (!customCode.isDeployed) {
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
      await setIsDeployed(customCode.id);
    }
  }
};

const stopArchitecture = async () => {
  const customCodes = await getCustomCodes();
  for (const customCode of customCodes) {
    await pauseDockerContainer(customCode.id);
    await setIsPaused(customCode.id);
  }
};

const restartArchitecture = async () => {
  const customCodes = await getCustomCodes();
  for (const customCode of customCodes) {
    if (customCode.isPaused) {
      await unpauseDockerContainer(customCode.id);
      await setIsPaused(customCode.id);
    }
  }
  await deployArchitecture();
};

const clearArchitecture = async () => {
  try {
    const dataFilePath = path.resolve(
      __dirname,
      "../../customCodeDatabase.json"
    );
    const customCodes = await getCustomCodes();
    for (const customCode of customCodes) {
      if (customCode.isDeployed) {
        await killDockerContainer(customCode.id);
        await removeDockerContainer(customCode.id);
        await removeDockerImage(customCode.id);
      }
    }
    await fs.writeFile(dataFilePath, "[]", "utf8");
    console.log("Docker erfolgreich geleert, JSON erfolgreich geleert");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const scaleOut = async (id) => {
  try {
    const dataFilePath = path.resolve(
      __dirname,
      "../../customCodeDatabase.json"
    );
    const customCodes = await getCustomCodes();
    const codeToScale = customCodes.find((code) => code.id === id);
    if (!codeToScale) {
      throw new CustomError("Need to code first!", 500);
    } else if (!codeToScale.isDeployed) {
      throw new CustomError("Need to deploy first!", 500);
    }
    const scaledCode = JSON.parse(JSON.stringify(codeToScale));
    scaledCode.isScaled = id;
    scaledCode.id = uuidv4();
    scaledCode.isDeployed = false;
    scaledCode.isPaused = false;
    customCodes.push(scaledCode);
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(customCodes, null, 2),
      "utf8"
    );
    await restartArchitecture();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const scalingCounter = async () => {
  const customCodes = await getCustomCodes();

  const idCounts = {};

  customCodes.forEach((code) => {
    if (code.id !== undefined) {
      if (!idCounts[code.id] && code.isScaled === "") {
        idCounts[code.id] = 0;
        idCounts[code.id]++;
      }
      if (code.isScaled !== "") {
        idCounts[code.isScaled]++;
      }
    }
  });

  const result = Object.keys(idCounts).map((id) => {
    return { id: id, count: idCounts[id] };
  });

  return result;
};

module.exports = {
  emptyDockerJS,
  fillDockerJS,
  emptyCustomCodeDatabase,
  addCustomCodeToJson,
  getCustomCodes,
  deployArchitecture,
  clearArchitecture,
  stopArchitecture,
  restartArchitecture,
  scaleOut,
  scalingCounter,
};
