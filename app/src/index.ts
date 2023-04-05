// Libs
import express from "express";
import helmet from "helmet";

import router from "@router";
import LoggerFactory from "@logger";
import MigrationsModel from "@models/migrationModel";

// Data
const app = express();
const PORT = process.env.PORT || 80;

// Code
app.use(express.json());
app.use(helmet());
app.use(router);

async function main() {
  // Do the migrations.
  const logger = LoggerFactory.createLogger("SERVER");
  await MigrationsModel.start(logger);

  // Start the server.
  app.listen(PORT, () => {
    logger.info(`The server is up on port: ${PORT}`);
  });
}

main();
