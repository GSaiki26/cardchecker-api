// Libs
import winston, { createLogger, Logger } from "winston";
const { printf, combine, timestamp, colorize } = winston.format;

// Classes
class LoggerFactory {
  /**
   * A method to create the default logger from the server.
   * @param owner - The owner's logger.
   */
  public static createLogger(owner: string): Logger {
    return createLogger({
      format: combine(
        colorize(),
        timestamp(),
        printf(
          (info) =>
            `[${info.timestamp}] (${info.level}) SERVER#${process.pid} ${owner} - ${info.message}`
        )
      ),
      transports: [new winston.transports.Console()],
    });
  }
}

// Code
export default LoggerFactory;
