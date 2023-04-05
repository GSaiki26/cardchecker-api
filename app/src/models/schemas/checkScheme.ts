// Libs
import { ModelAttributes, STRING, UUIDV4, UUID, DATE } from "sequelize";

// Schema
const CheckScheme: ModelAttributes = {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  card_id: {
    type: STRING,
    allowNull: false,
  },
  check_time: {
    type: DATE,
    allowNull: false
  },
  fk_worker_id: {
    type: UUID,
    allowNull: false
  }
};

// Code
export default CheckScheme;
