// Libs
import { Logger } from "winston";

import WorkerModel from "./workerModel";

// Class
class SecurityModel {
  /**
   * A method to check if the card id is valid.
   * @param cardId - The card id to be checked.
   */
  public static async isValidCardId(cardId: string): Promise<boolean> {
    // Check the format.
    if (!cardId) return false;
    if (!/^.{10}$/.test(cardId)) return false;
    return true;
  }

  public static isValidIsoFormat(date: string[]): boolean {
    // Check if all the provided dates are valid.
    for (let i = 0; i < date.length; i++) {
      if (isNaN(new Date(date[i]).getDate())) return false;
    }

    return true;
  }
}

// Code
export default SecurityModel;
