// Libs
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { Model } from "sequelize";
import { Logger } from "winston";

import cardcheckerMessages from "../proto/cardchecker_pb";

import LoggerFactory from "../logger/loggerFactory";
import CheckModel from "../models/checkModel";
import MailModel from "../models/mailModel";
import SecurityModel from "../models/securityModel";
import WorkerModel from "../models/workerModel";

// Types
import * as types from "../types/types";

// Class
class CardCheckerService {
  /**
   * A method to create a check.
   */
  public static async create(
    call: ServerUnaryCall<cardcheckerMessages.CreateReq, any>,
    cb: sendUnaryData<cardcheckerMessages.DefaultRes>
  ): Promise<any> {
    // Define the logger.
    const logger = LoggerFactory.createLogger(call.getPeer());
    logger.info("Request to: " + call.getPath());

    // Check the request's body.
    logger.info("Checking body...");
    const { cardid, checkdate, sendmail } = call.request.toObject();

    if (!SecurityModel.isValidCardId(cardid)) {
      logger.warn("Invalid card id.");
      return cb({
        name: "400",
        message: "Invalid card id.",
      });
    }

    if (!SecurityModel.isValidIsoFormat([checkdate])) {
      logger.warn("CheckDate is in a wrong format.");
      return cb({
        name: "400",
        message: "Invalid checkdate format.",
      });
    }
    const checkMoment = new Date(checkdate);

    // Get the card's owner.
    const worker = await new WorkerModel(logger).findByCardId(cardid);
    if (!worker) return cb({
      name: "400",
      message: "Worker not found.",
    });

    // Create the new check.
    const check = await new CheckModel(logger).create({
      check_time: checkMoment,
      fk_worker_id: worker.getId(),
    });
    if (!check) return cb({
      name: "400",
      message: "Invalid request.",
    });

    // Return the response.
    logger.info("Returning the check to the client...");
    cb(null, new cardcheckerMessages.DefaultRes().setData(this.dbCheckToProtoCheck(check)));

    // Send the email to the owner and the sender.
    if (sendmail) await new MailModel(logger).sendMail(worker, checkMoment);
  }

  /**
   * A method to get all the checks between some period range.
   */
  public static async getRange(
    call: ServerUnaryCall<cardcheckerMessages.GetRangeReq, any>,
    cb: sendUnaryData<cardcheckerMessages.GetRangeRes>
  ): Promise<any> {
    // Define the logger.
    const logger = LoggerFactory.createLogger(call.getPeer());
    logger.info("Request to: " + call.getPath());

    // Check the request's body.
    const { cardid, dateinit, dateend } = call.request.toObject();

    if (!SecurityModel.isValidCardId(cardid)) {
      logger.warn("Invalid card id.");
      return cb({
        name: "400",
        message: "Invalid card id.",
      });
    }

    if (!SecurityModel.isValidIsoFormat([dateinit, dateend])) {
      logger.warn("CheckDate is in a wrong format.");
      return cb({
        name: "400",
        message: "Invalid checkdate format.",
      });
    }

    // Try to find the worker in the database.
    const worker = await new WorkerModel(logger).findByCardId(cardid);
    if (!worker) return cb({
      name: "400",
      message: "Worker not found.",
    });

    // Check if the check exists in the database.
    const checks = await new CheckModel(logger).findByRange(
      worker.getId(),
      new Date(dateinit),
      new Date(dateend)
    );
    if (!checks.length) return cb({
      name: "400",
      message: "Invalid request.",
    });

    // Treat the data from the checks.
    const treated = checks.map((check) =>
      this.dbCheckToProtoCheck(check)
    );

    // Return the checks.
    logger.info("Returning informations from the checks...");
    cb(null, new cardcheckerMessages.GetRangeRes().setDataList(treated));
  }

  /**
   * A method to delete some check.
   */
  public static async delete(
    call: ServerUnaryCall<cardcheckerMessages.DeleteReq, any>,
    cb: sendUnaryData<cardcheckerMessages.DeleteRes>
  ): Promise<any> {
    // Define the logger.
    const logger = LoggerFactory.createLogger(call.getPeer());
    logger.info("Request to: " + call.getPath());

    // Check the bearer.
    const { checkid, masterkey } = call.request.toObject();
    if (process.env.MASTER_KEY != masterkey) {
      logger.warn("Master key not authorized.");
      return cb({
        name: "403",
        message: "Not authorized.",
      });
    }

    // Delete the check.
    const affectedRows = await new CheckModel(logger).delete(checkid);
    if (isNaN(affectedRows!)) {
      return cb({
        name: "400",
        message: "Invalid checkId",
      });
    }

    cb(null, new cardcheckerMessages.DeleteRes().setStatus("Success"));
  }

  /**
   * A method to convert a DB check entry to a grpc message check.
   * @param dbCheck 
   * @returns 
   */
  public static dbCheckToProtoCheck(dbCheck: Model<types.DbCheck>): cardcheckerMessages.Check {
    const check = dbCheck.toJSON();
    return new cardcheckerMessages.Check()
    .setId(check.id)
    .setChecktime(check.check_time.toISOString())
    .setWorkerid(check.fk_worker_id);
  }
}

// Code
export default CardCheckerService;
