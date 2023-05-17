// Libs
import cluster from "cluster";
import { readFileSync } from "fs";
import { cpus } from "os";

import * as grpc from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import LoggerFactory from "./logger/loggerFactory";
import CardCheckerService from "./services/cardcheckerService";
import DatabaseModel from "./models/databaseModel";

// Data
const HOST = "0.0.0.0:3000";
const server = new grpc.Server();
const creds = grpc.ServerCredentials.createSsl(
  readFileSync("./certs/ca.pem"),
  [
    {
      cert_chain: readFileSync("./certs/server.pem"),
      private_key: readFileSync("./certs/server.pem.key"),
    },
  ],
  true
);

// Routes
// CardChecker
const cardCheckerProto = loadSync("./proto/cardchecker.proto");
const cardCheckerDef: any =
  grpc.loadPackageDefinition(cardCheckerProto).cardchecker;
server.addService(cardCheckerDef.CardCheckerService.service, {
  Create: CardCheckerService.create.bind(CardCheckerService),
  GetRange: CardCheckerService.getRange.bind(CardCheckerService),
  Delete: CardCheckerService.delete.bind(CardCheckerService),
});

// Code
async function main() {
  // Do the migrations.
  const logger = LoggerFactory.createLogger("SERVER");

  // Runs the migrations.
  if (cluster.isPrimary) {
    await DatabaseModel.migrations(logger);

    if (process.env.K8S_ENABLED == "false") {
      for (let i = 0; i < cpus().length; i++) {
        cluster.fork();
      }

      cluster.on("exit", (clusterWorker, code) => {
        const workerPid = clusterWorker.process.pid;
        logger.info(`The worker #${workerPid} has exited with code: ${code}`);
      });
    }
    return;
  }

  // Start the server.
  server.bindAsync(HOST, creds, (err, port) => {
    const logger = LoggerFactory.createLogger("SERVER");

    if (err) {
      logger.error("Couldn't start the server. " + err);
      return;
    }

    server.start();
    logger.info(`The server is up on port: ${port}`);
  });
}

main();
