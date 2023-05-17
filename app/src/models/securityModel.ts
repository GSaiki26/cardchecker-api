// Libs
import { Model } from "sequelize";

// Types
import { DbCheck, ProtoCheck } from "../types/types";

type Check = Model<DbCheck>;

// Class
class SecurityModel {
  public static isValidCardId(cardId: string): boolean {
    if (!cardId) return false;
    if (cardId.length != 10) return false;
    return true;
  }

  public static isValidIsoFormat(date: string[]): boolean {
    // Check if all the provided dates are valid.
    for (let i = 0; i < date.length; i++) {
      if (isNaN(new Date(date[i]).getDate())) return false;
    }

    return true;
  }

  public static dbCheckToProtoCheck(dbCheck: Check): ProtoCheck {
    const check = dbCheck.toJSON();
    return {
      id: check.id,
      checkTime: check.check_time.toISOString(),
      workerId: check.fk_worker_id,
    };
  }
}

// Code
export default SecurityModel;
