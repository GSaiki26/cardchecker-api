// Libs
import { randomUUID } from "crypto";

import { Model, Op } from "sequelize";
import { Logger } from "winston";

import DatabaseModel from "./databaseModel";
import CheckScheme from "./schemas/checkScheme";

import { DbCheck } from "../types/types";

// Types
type Check = Model<DbCheck>;

// Class
class CheckModel {
  private logger: Logger;
  private model = DatabaseModel.seq.define<Check>("checks", CheckScheme);

  constructor(logger: Logger) {
    this.logger = logger;
    this.model.beforeCreate("checks", async (check) => {
      // Set the id.
      (check as any).id = randomUUID().replace(/-/g, "");
    });
  }

  /**
   * A method to sync the database.
   */
  public async sync(): Promise<void> {
    this.logger.info("Syncing checks table...");
    await this.model.sync();
    this.logger.info("Checks table synced.");
  }

  /**
   * A method to create a check in the database.
   * @param entry - The Dbcheck entry to be added in the database.
   */
  public async create(entry: Omit<DbCheck, "id">): Promise<Check | undefined> {
    this.logger.info("Trying to create some check...");

    // try to create the check.
    try {
      const model = await this.model.create(entry as any);
      this.logger.info("The check was created.");

      return model;
    } catch (err) {
      this.logger.warn("Couldn't create the check. " + err);
      return;
    }
  }

  /**
   * A method to find some check in the database.
   * @param checkId - The id from the check.
   */
  public async findById(checkId: string): Promise<Check | undefined> {
    this.logger.info(`Trying to find the check #${checkId}`);

    try {
      const check = await this.model.findOne({
        where: {
          id: checkId
        }
      });
      if (!check) throw "Any check found.";

      this.logger.info("The check was found.");
      return check;
    } catch (err) {
      this.logger.warn("Couldn\'t find the check. " + err);
      return;
    }
  }

  /**
   * A method to find all checks  between a period in the database.
   * @param workerId - The card the id to search.
   * @param dateInit - The start of the period.
   * @param dateEnd - The end of the period.
   */
  public async findByRange(workerId: string, dateInit: Date, dateEnd: Date): Promise<Check[]> {
    this.logger.info(
      `Trying to find all the checks between: ${dateInit} - ${dateEnd}...`
    );

    try {
      const checks = await this.model.findAll<Check>({
        where: {
          fk_worker_id: workerId,
          check_time: {
            [Op.between]: [dateInit, dateEnd],
          },
        },
      });
      this.logger.info(`Was found ${checks.length} checks.`);

      return checks;
    } catch (err) {
      this.logger.warn("Couldn't find the checks. " + err);
      return [];
    }
  }

  /**
   * A method to delete a check in the database.
   * @param checkId - The check id to be deleted.
   */
  public async delete(checkId: string): Promise<number> {
    this.logger.info("Trying to delete some check...");
    try {
      const rowsDeleted = await this.model.destroy({
        where: {
          id: checkId,
        },
      });
      this.logger.info(`${rowsDeleted} rows were deleted.`);

      return rowsDeleted;
    } catch (err) {
      this.logger.warning("Couldn't delete the rows. " + err);
      return 0;
    }
  }
}

// Code
export default CheckModel;
