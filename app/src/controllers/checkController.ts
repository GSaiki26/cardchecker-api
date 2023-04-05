// Libs
import { Request, Response } from "express";
import { Model } from "sequelize";

import CheckModel from "@models/checkModel";
import MailModel from "@models/mailModel";
import WorkerModel from "@models/workerModel";
import { Worker } from "@types";

// Class
class CheckController {
  /**
   * POST /check
   */
  public static async post(req: Request, res: Response): Promise<any> {
    // Check the request's body.
    req.logger.info("Checking body...");
    const { cardId, checkDate } = req.body;
    if (!cardId || !checkDate) {
      req.logger.warn("Incorrect body. Returning...");
      return res.status(400).json({
        status: "Error",
        message: "Incorrect body.",
      });
    }

    // Treat the body.
    req.logger.info("Treating body...");
    const checkMoment = new Date((checkDate as string).slice(0, -1));

    // Try to get the card's owner.
    req.logger.info("Trying to get the card's owner...");
    let worker: Worker | null = null;
    try {
      worker = await new WorkerModel(req.logger).findByCardId(cardId);
      if (!worker.id) throw "Worker not found.";
    } catch (err) {
      req.logger.warn("The worker was not found. Returning...");
      return res.sendStatus(400);
    }

    // Create the new check.
    const checkModel = new CheckModel(req.logger);
    let model: Model | null = null;
    try {
      model = await checkModel.create({
        check_time: checkMoment,
        fk_worker_id: worker.id,
      });
    } catch (err) {
      req.logger.error(`Couldn\'t create the check. Error: ${err}`);
      return res.status(400).json({
        status: "Error",
        message: err,
      });
    }

    // Return the response.
    req.logger.info("Returning...");
    res.status(201).json({
      status: "Success",
      data: model.toJSON(),
    });

    // Send the email to the owner and the sender.
    await new MailModel(req.logger).sendMail(worker, checkMoment);
  }

  /**
   * GET /check/:cardId
   */
  public static async get(req: Request, res: Response): Promise<any> {
    // Check if has the param.
    if (!req.params.cardId) {
      req.logger.warn("No card to check.");
      return res.status(400).json({
        status: "Error",
        message: "No card to check.",
      });
    }

    // Try to get the card's owner.
    req.logger.info("Trying to get the card's owner...");
    let worker: Worker | null = null;
    try {
      worker = await new WorkerModel(req.logger).findByCardId(req.params.cardId);
      if (!worker.id) throw "Worker not found.";
    } catch (err) {
      req.logger.warn("The worker was not found. Returning...");
      return res.sendStatus(400);
    }

    // Check if the check exists in the database.
    const checkModel = new CheckModel(req.logger);
    let checks: Model[] = [];
    try {
      checks = await checkModel.findAll({
        fk_worker_id: worker.id,
      });
    } catch (err) {
      req.logger.warn(`Error while trying to find checks. Error: ${err}`);
    }

    if (!checks.length) {
      req.logger.info("The checks was not found.");
      return res.status(400).json({
        status: "Error",
        message: "Bad card id.",
      });
    }

    // Treat the data from the checks.
    const treated = checks.map((check: any) => {
      return {
        id: check.id,
        cardId: check.card_id,
        checkDate: check.check_time,
      };
    });

    // Return the checks.
    req.logger.info("Returning informations from the checks...");
    return res.status(200).json({
      status: "Success",
      data: treated,
    });
  }

  /**
   * DELETE /check/:checkId
   */
  public static async delete(req: Request, res: Response): Promise<any> {
    // Check the bearer.
    if (req.permission != "admin") {
      req.logger.warn("Bearer not authorized. Returning...");
      return res.status(401).json({
        status: "Error",
        message: "Authorization has failed.",
      });
    }

    // Check if the check id was provided.
    if (!req.params.checkId) {
      req.logger.warn("No Check id to delete. Returning...");
      return res.sendStatus(400);
    }

    // Delete the check.
    const checkModel = new CheckModel(req.logger);
    try {
      const affectedRows = await checkModel.delete(req.params.checkId);
      if (affectedRows < 1) {
        throw "Any row affected.";
      }
      req.logger.info("Returning...");
      res.status(201).json({
        status: "Success",
        data: {
          affectedRows: affectedRows,
        },
      });
    } catch (err) {
      req.logger.error(err);
      req.logger.info("Returning...");
      res.status(400).json({
        status: "Error",
        message: err,
      });
    }
  }
}

// Code
export default CheckController;
