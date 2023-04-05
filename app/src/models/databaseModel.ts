// Libs
import sequelize from "sequelize";

// Class
/**
 * A database to be inherited from all models.
 */
class DatabaseModel {
  public static seq = new sequelize.Sequelize({
    host: "cardchecker-db",
    port: 5432,
    dialect: "postgres",
    database: process.env.POSTGRES_USER,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    pool: {
      min: 1,
      max: 100,
      idle: 1000 * 6,
      acquire: 1000 * 6,
    },
    logging: false,
  });
}

// Code
export default DatabaseModel;
