const { spawnSync } = require("child_process");

function startRabbitmq() {
  console.log(`::Start building DockerImage for RABBITMQ`);
  let processPullRabbitmq = spawnSync(`docker pull rabbitmq:management`, [], {
    shell: true,
    encoding: "utf8",
    stdio: ["inherit", "inherit", "pipe"],
  });
  let processNetwork = spawnSync(`docker network create rabbitmq-network`, [], {
    shell: true,
    encoding: "utf8",
    stdio: ["inherit", "inherit", "pipe"],
  });
  let process = spawnSync(
    `docker run -d --hostname my-rabbit --name rabbit --network rabbitmq-network -e RABBITMQ_DEFAULT_USER=mquser -e RABBITMQ_DEFAULT_PASS=mqpass -p 15672:15672 -p 5672:5672 --restart=unless-stopped rabbitmq:management`,
    [],
    {
      shell: true,
      encoding: "utf8",
      stdio: ["inherit", "inherit", "pipe"],
    }
  );

  if (processPullRabbitmq.stderr) {
    console.log(`::Rabbitmq Pull failed`);
    throw new Error(process.stderr);
  }
  if (processNetwork.stderr) {
    console.log(`::Docker Network for rabbitmq failed`);
    throw new Error(process.stderr);
  }
  if (process.stderr) {
    console.log(`::DockerImage for RABBITMQ build failed!`);
    throw new Error(process.stderr);
  }
}

function buildDockerImage(path, dockerImageName) {
  console.log(`::Start building DockerImage ${dockerImageName}`);
  let process = spawnSync(
    `docker-buildx build -t ${dockerImageName} -q ${path}`,
    [],
    {
      shell: true,
      encoding: "utf-8",
      stdio: ["inherit", "inherit", "pipe"],
    }
  );

  if (process.stderr) {
    console.log(`::DockerImage ${dockerImageName} build failed!`);
    throw new Error(process.stderr);
  }
}

function runDockerContainerMultiPortMapping(
  dockerImageName,
  dockerContainerName,
  portMappingArray
) {
  let portMappingString = portMappingArray
    .map((element) => "-p " + element.hostPort + ":" + element.containerPort)
    .join(" ");
  console.log(
    `::Start running DockerContainer for image ${dockerImageName}...`
  );
  let process = spawnSync(
    `docker run --name ${dockerContainerName} -h ${dockerContainerName} -d --network rabbitmq-network ${portMappingString} ${dockerImageName}`,
    [],
    { shell: true, stdio: "inherit" }
  );
  if (process.stderr) {
    console.log(`::DockerContainer ${dockerContainerName} run failed!`);
    throw new Error(process.stderr);
  }
  console.log(`::Container ${dockerContainerName} running...`);
}

function runDockerContainer(
  dockerImageName,
  dockerContainerName,
  hostPort,
  containerPort
) {
  runDockerContainerMultiPortMapping(dockerImageName, dockerContainerName, [
    { hostPort: hostPort, containerPort: containerPort },
  ]);
}

function killDockerContainer(dockerContainerName) {
  console.log(`::Start killing DockerContainer ${dockerContainerName}...`);
  let process = spawnSync(`docker kill ${dockerContainerName}`, [], {
    shell: true,
    stdio: "inherit",
  });
  console.log(`::DockerContainer ${dockerContainerName} killed`);
}

function removeDockerContainer(dockerContainerName) {
  console.log(`::Start remove DockerContainer ${dockerContainerName}...`);
  let process = spawnSync(`docker rm ${dockerContainerName}`, [], {
    shell: true,
    stdio: "inherit",
  });
  console.log(`::DockerContainer ${dockerContainerName} removed`);
}

function removeDockerImage(dockerImageName) {
  console.log(`::Start remove DockerImage ${dockerImageName}...`);
  let process = spawnSync(`docker image rm ${dockerImageName}`, [], {
    shell: true,
    encoding: "utf-8",
    stdio: ["inherit", "inherit", "pipe"],
  });

  if (process.stderr) {
    console.log(`::DockerImage ${dockerImageName} could not be removed!`);
    console.log(process.stderr);
    throw new Error(process.stderr);
  }
}

function getRunningContainerInfosByName(name) {
  console.log(`::Start get running DockerContainers by name '${name}'...`);
  let process = spawnSync(
    `docker ps --filter name=${name} --format {{.Names}}`,
    [],
    { shell: true, encoding: "utf-8" }
  );
  let commaSeparatedOutputOfConsole = process.stdout.replace(
    /(\r\n|\n|\r)/gm,
    ","
  );
  let containerIDsArray = commaSeparatedOutputOfConsole.split(",").slice(0, -1);

  let containerInfosArray = [];
  containerIDsArray.forEach(function (element, index) {
    let processGetPort = spawnSync(`docker port ${element}`, [], {
      shell: true,
      encoding: "utf-8",
    });
    let port = processGetPort.stdout.split(":")[1];
    containerInfosArray.push({ name: element, port: port });
  });

  return containerInfosArray;
}

function getInternalIPAddressOfDockerContainer(dockerContainerName) {
  console.log(
    `::Start get IPAddress of DockerContainer by name '${dockerContainerName}'...`
  );
  let process = spawnSync(
    "docker inspect -f {{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}} " +
      dockerContainerName,
    [],
    { shell: true, encoding: "utf-8" }
  );
  return process.stdout.replace(/(\r\n|\n|\r)/gm, "");
}

function getContainerImageInfosByName(name) {
  console.log(`::Start get DockerImages by name '${name}*'...`);
  let process = spawnSync(
    `docker images ${name}* --format {{.Repository}}`,
    [],
    { shell: true, encoding: "utf-8" }
  );
  let commaSeparatedOutputOfConsole = process.stdout.replace(
    /(\r\n|\n|\r)/gm,
    ","
  );
  let imageIDsArray = commaSeparatedOutputOfConsole.split(",").slice(0, -1);

  let imageInfosArray = [];
  imageIDsArray.forEach(function (element, index) {
    imageInfosArray.push({ name: element });
  });

  return imageInfosArray;
}

function buildAndRunDocker(
  path,
  dockerImageName,
  dockerContainerName,
  hostPort,
  containerPort
) {
  buildDockerImage(path, dockerImageName);
  runDockerContainer(
    dockerImageName,
    dockerContainerName,
    hostPort,
    containerPort
  );
}

module.exports = {
  buildDockerImage,
  runDockerContainer,
  startRabbitmq,
  killDockerContainer,
  removeDockerContainer,
  removeDockerImage,
};
