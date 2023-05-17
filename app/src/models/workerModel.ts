// Libs
import { readFileSync } from "fs";

import * as grpc from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

import { Logger } from "winston";

import * as types from "../types/types";

// Class
class WorkersModel {
  private static SERVER_URI = process.env.WORKER_API_URI;

  private logger: Logger;
  private static workerProto = loadSync("./proto/worker.proto");
  private static workerDef: any = grpc.loadPackageDefinition(
    WorkersModel.workerProto
  ).worker;

  private static creds = grpc.ChannelCredentials.createSsl(
    readFileSync("./certs/ca.pem"),
    readFileSync("./certs/server.pem.key"),
    readFileSync("./certs/server.pem")
  );
  private static client = new WorkersModel.workerDef.WorkerService(
    WorkersModel.SERVER_URI,
    WorkersModel.creds
  );

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * A method to find some worker using the card id.
   */
  public async findByCardId(
    cardId: string
  ): Promise<types.ProtoWorker | undefined> {
    // Try to find the card Id.
    this.logger.info("Trying to find the card id #" + cardId);

    let reqRes: types.ProtoWorkerDefaultRes;
    const reqBody = {cardId: cardId};

    try {
      reqRes = await this.doRequest("GetByCardId", reqBody);
    } catch (err) {
      this.logger.error("Couldn't find the worker. " + err);
      return;
    }

    this.logger.info("Worker found.");
    return reqRes.data;
  }

  private async doRequest<ResponseType = types.ProtoWorkerDefaultRes>(method: string, req: any): Promise<ResponseType> {
    this.logger.info("Doing request to /worker.WorkerService/" + method);

    const pros = new Promise<ResponseType>((resolve, reject) => {
      WorkersModel.client[method](req, (err: Error, res: ResponseType) => {
        if (err) reject(err);
        return resolve(res);
      });
    });

    return await pros;
  }
}

// Code
export default WorkersModel;
