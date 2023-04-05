// Libs
import { Logger } from "winston";
import CheckModel from "@models/checkModel";

// Class
class MigrationsModel {
  public static async start(logger: Logger) {
    logger.info("Starting migrations...");
    const credsModel = new CheckModel(logger);
    await credsModel.sync();
  }
}

// Code
export default MigrationsModel;
