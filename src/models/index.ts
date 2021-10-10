const Sequelize = require("sequelize")
import config from "../config/bot.conf"
const dbConfig = config.db_config



const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
})

const db: any = {}

db.sequelize = sequelize

db.tickets = require("./tickets.model")(sequelize, Sequelize)

export default db