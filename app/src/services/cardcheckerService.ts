// Libs
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { Logger } from "winston";

import LoggerFactory from "../logger/loggerFactory";
import CheckModel from "../models/checkModel";
import MailModel from "../models/mailModel";
import WorkerModel from "../models/workerModel";

import * as types from "../types/types";
import SecurityModel from "../models/securityModel";
import { Model } from "sequelize";

// Class
class CardCheckerService {
  /**
   * A method to create a check.
   */
  public static async create(
    call: ServerUnaryCall<types.ProtoCreateReq, any>,
    cb: sendUnaryData<types.ProtoDefaultRes>
  ): Promise<any> {
    // Define the logger.
    const logger = LoggerFactory.createLogger(call.getPeer());
    logger.info("Request to: " + call.getPath());

    // Check the request's body.
    logger.info("Checking body...");
    const { cardId, checkDate, sendMail } = call.request;

    // Check if the request's checkDate is valid.
    if (!SecurityModel.isValidIsoFormat([checkDate])) {
      logger.warn("Incorrect body.");
      return cb({
        name: "400",
        message: "Invalid request.",
      });
    }
    const checkMoment = new Date(checkDate);

    // Get the card's owner.
    const worker = await this.getWorkerByCardId(logger, cardId);
    if (!worker) {
      return cb({
        name: "400",
        message: "Invalid request."
      });
    };

    // Create the new check.
    const checkModel = new CheckModel(logger);
    const model = await checkModel.create({
      check_time: checkMoment,
      fk_worker_id: worker.id,
    });
    if (!model) {
      return cb({
        name: "400",
        message: "Invalid request."
      });
    }

    // Return the response.
    logger.info("Returning the check to the client...");
    cb(null, {
      data: SecurityModel.dbCheckToProtoCheck(model)
    });

    // Send the email to the owner and the sender.
    if (sendMail) await new MailModel(logger).sendMail(worker, checkMoment);
  }

  /**
   * A method to get all the checks between some period range.
   */
  public static async getRange(
    call: ServerUnaryCall<types.ProtoGetRangeReq, any>,
    cb: sendUnaryData<types.ProtoGetRangeRes>
  ): Promise<any> {
    // Define the logger.
    const logger = LoggerFactory.createLogger(call.getPeer());
    logger.info("Request to: " + call.getPath());

    // Check if the card id is valid.
    const { cardId, dateInit, dateEnd } = call.request;
    const worker = await this.getWorkerByCardId(logger, cardId);
    if (!worker) {
      logger.warn("The worker was not found.");
      return cb({
        name: "400",
        message: "Invalid request."
      });
    };

    // Check if the provided period is valid.
    if (!SecurityModel.isValidIsoFormat([dateInit, dateEnd])) {
      logger.warn("Invalid request.");
      return cb({
        name: "400",
        message: "Invalid request."
      });
    }

    // Check if the check exists in the database.
    const checks = await new CheckModel(logger).findByRange(
      worker.id, new Date(dateInit), new Date(dateEnd)
    );
    if (!checks.length) {
      return cb({
        name: "400",
        message: "Invalid request."
      });
    }

    // Treat the data from the checks.
    const treated = checks.map((check) => SecurityModel.dbCheckToProtoCheck(check));

    // Return the checks.
    logger.info("Returning informations from the checks...");
    cb(null, {
      data: treated
    });
  }

  /**
   * A method to delete some check.
   */
  public static async delete(
    call: ServerUnaryCall<types.ProtoDeleteReq, any>,
    cb: sendUnaryData<types.ProtoDeleteRes>
  ): Promise<any> {
    // Define the logger.
    const logger = LoggerFactory.createLogger(call.getPeer());
    logger.info("Request to: " + call.getPath());

    // Check the bearer.
    const { checkId, masterKey } = call.request;
    if (process.env.MASTER_KEY != masterKey) {
      logger.error("Master key not authorized.");
      return cb({
        name: "403",
        message: "Not authorized."
      });
    }

    // Delete the check.
    const affectedRows = await new CheckModel(logger).delete(checkId);
    if (!affectedRows) {
      return cb({
        name: "400",
        message: "Invalid checkId"
      });
    }

    cb(null, {
      status: "Success"
    });
  }

  /**
   * A method to get a worker using his card Id.
   * If not found, return null.
   * @param logger - The logger object to trace the stack.
   * @param cardId - The card id. It must belongs to some worker.
   */
  private static async getWorkerByCardId(logger: Logger, cardId: string): Promise<types.ProtoWorker | undefined> {
    // Check if the provided card is valid.
    if (!SecurityModel.isValidCardId(cardId)) {
      logger.info("The provided card is invalid.");
      return;
    }

    // Try to found the worker.
    const worker = await new WorkerModel(logger).findByCardId(cardId);
    return worker;
  }
}

// Code
export default CardCheckerService;
