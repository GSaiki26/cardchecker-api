// Libs
import { randomUUID } from "crypto";
import { Model } from "sequelize";
import { Logger } from "winston";

import DatabaseModel from "@models/databaseModel";
import CheckScheme from "@models/schemas/checkScheme";

// Class
class CheckModel {
  private logger: Logger;
  private model = DatabaseModel.seq.define("checks", CheckScheme);

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
   * @param query - The query to create the check.
   */
  public async create(entry: any): Promise<Model> {
    this.logger.info("Trying to create some check...");
    return await this.model.create(entry);
  }

  /**
   * A method to find a check in the database.
   * @param query - The query to find the check.
   */
  public async findAll(query: any): Promise<Model[]> {
    this.logger.info("Trying to find some check...");
    return await this.model.findAll({
      where: query,
    });
  }

  /**
   * A method to delete a check in the database.
   * @param query - The query to delete the check.
   */
  public async delete(cardId: string): Promise<number> {
    this.logger.info("Trying to delete some check...");
    return await this.model.destroy({
      where: {
        card_id: cardId
      },
    });
  }
}

// Code
export default CheckModel;
