// Libs
import { readFileSync } from "fs";

import * as grpc from "@grpc/grpc-js";

import services from "../proto/cardchecker_grpc_pb";

import LoggerFactory from "../logger/loggerFactory";
import CardCheckerService from "../services/cardcheckerService";

// Data
const HOST = "0.0.0.0:3000";

// Class
class ServerModel {
  private static creds = grpc.ServerCredentials.createSsl(
    readFileSync("./certs/ca.pem"),
    [
      {
        cert_chain: readFileSync("./certs/server.pem"),
        private_key: readFileSync("./certs/server.pem.key"),
      },
    ],
    true
  );
  private server = new grpc.Server();

  constructor() {
    this.defineServices();
  }

  /**
   * A method to start the server.
   */
  public startServer(): void {
    // Start the server.
    this.server.bindAsync(HOST, ServerModel.creds, (err, port) => {
      const logger = LoggerFactory.createLogger("SERVER");
      if (err) {
        logger.error("Couldn't start the server. " + err);
        return;
      }

      this.server.start();
      logger.info(`The server is up on port: ${port}`);
    });
  }

  /**
   * A method to define the services from the server.
   */
  private defineServices(): void {
    this.server.addService(services.CardCheckerServiceService as any, {
      create: CardCheckerService.create.bind(CardCheckerService),
      delete: CardCheckerService.delete.bind(CardCheckerService),
      getRange: CardCheckerService.getRange.bind(CardCheckerService),
    });
  }
}

// Code
export default ServerModel;
