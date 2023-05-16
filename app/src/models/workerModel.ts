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

    let worker: types.ProtoWorker;
    try {
      worker = await this.doRequest<
        types.ProtoWorkerDefaultRes,
        types.ProtoWorker
      >("GetByCardId", (err, res) => {
        if (err) throw err;
        return res;
      });
    } catch (err) {
      this.logger.error("Couldn't find the worker. " + err);
      return;
    }

    this.logger.info("Worker found.");
    return worker;
  }

  private doRequest<ResponseType, ReturnType = any>(
    method: string,
    cb: (err: Error, res: ResponseType) => any
  ): Promise<ReturnType> {
    return new Promise((resolve, reject) => {
      this.logger.info("Doing request to: workers/" + method);
      return resolve(WorkersModel.client[method](cb));
    });
  }
}

// Code
export default WorkersModel;
