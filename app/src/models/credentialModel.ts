// Libs
import axios, { AxiosError } from "axios";
import { Logger } from "winston";

// Class
class CredentialModel {
  /**
   * A method to check if the credential is valid.
   */
  public static async credLevel(
    logger: Logger,
    cred: string
  ): Promise<string | void> {
    logger.info("Checking if the credential is valid...");
    try {
      const url = `http://creds-api/creds/${cred}`;
      const res = await axios.get(url);
      return res.data.data.level;
    } catch (err) {
      const error = err as AxiosError;
      if (!error.response) {
        logger.error(`Couldn\'t complete the request. Error: ${error}`);
        return;
      }
      logger.warn("The provided credential is not valid.");
      return;
    }
  }
}

// Code
export default CredentialModel;
