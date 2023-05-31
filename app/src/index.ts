// Libs
import cluster from "cluster";
import { cpus } from "os";

import LoggerFactory from "./logger/loggerFactory";
import DatabaseModel from "./models/databaseModel";
import ServerModel from "./models/serverModel";

// Data
const mainLogger = LoggerFactory.createLogger("SERVER");

// Functions
async function main() {
  // Runs the migration if primary cluster.
  if (cluster.isPrimary) await DatabaseModel.migrations(mainLogger);

  // Start the forking process if MULTI_CLUSTER is enabled.
  if (process.env.MULTI_CLUSTER == "true") {
    mainLogger.info("MULTI_CLUSTER option is enabled. Forking cluster...");
    for (let i = 0; i < cpus().length; i++) {
      cluster.fork();
    }
    return;
  }

  // Start the server.
  const serverModel = new ServerModel();
  serverModel.startServer();
}

// Events
cluster.on("exit", (clusterWorker, code) => {
  const workerPid = clusterWorker.process.pid;
  mainLogger.info(`The worker #${workerPid} has exited with code: ${code}`);
});

// Code
main();
