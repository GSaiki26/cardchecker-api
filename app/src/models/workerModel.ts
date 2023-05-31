// Libs
import { readFileSync } from "fs";

import * as grpc from "@grpc/grpc-js";
import { Logger } from "winston";

import messages from "../proto/worker_pb";
import services from "../proto/worker_grpc_pb";

// Class
class WorkerModel {
  private static SERVER_URI = process.env.WORKER_API_URI!;
  private static creds = grpc.ChannelCredentials.createSsl(
    readFileSync("./certs/ca.pem"),
    readFileSync("./certs/server.pem.key"),
    readFileSync("./certs/server.pem")
  );
  private static client = new services.WorkerServiceClient(
    WorkerModel.SERVER_URI,
    WorkerModel.creds
  );

  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * A method to find some worker using the card id.
   */
  public async findByCardId(cardId: string): Promise<messages.Worker | void> {
    this.logger.info("Trying to find the card id #" + cardId);

    // Define the request's body.
    const reqBody = new messages.GetByCardIdReq()
    .setCardid(cardId);

    // Do the request.
    const res: messages.DefaultRes | null = await new Promise(resolve => {
      WorkerModel.client.getByCardId(reqBody, (err, res) => {
        if (err) {
          this.logger.error("Couldn't find the worker. " + err);
          return resolve(null);
        }
        resolve(res);
      });
    });

    if (!res) return;

    this.logger.info(`Worker #${res.getData()!.getId} found.`);
    return res.getData()!;
  }
}

// Code
export default WorkerModel;
