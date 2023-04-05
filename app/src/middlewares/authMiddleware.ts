// Libs
import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";

import LoggerFactory from "@logger";
import CredentialModel from "@models/credentialModel";

// Types
declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      permission?: "admin" | "user";
    }
  }
}

// Class
class AuthMiddleware {
  public static async auth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    // Add the logger to the request.
    req.logger = LoggerFactory.createLogger(req.ip);
    req.logger.info(`Request to ${req.method} ${req.url}`);

    // Check if the request has the master api key.
    const auth = req.headers.authorization?.split(" ")[1];
    const level = await CredentialModel.credLevel(req.logger, auth!);

    if (!level) {
      req.logger.warn("The auth is invalid.");
      return res.sendStatus(401);
    }

    req.logger.info(`Permission with level ${level}.`);
    req.permission = level as any;

    return next();
  }
}

// Code
export default AuthMiddleware;
