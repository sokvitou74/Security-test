const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

//const adminPassword = process.env.adminpass;
const adminPassword = "password";

const tokenKey = crypto.randomBytes(64 / 2).toString("hex").slice(0, 64);

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "storage.Database",
    define: {
        timestamps: false,
    },
});

const db = {};

db.sequelize = sequelize;

db.Users = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
    },
});

db.connect = async () => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

db.create = async () => {
    try {
        await db.Users.sync({ force: true });
        await db.Users.create({
            username: "admin",
            password: bcrypt.hashSync(adminPassword, 10),
            isAdmin: true,
        });
    } catch (error) {
        console.error("Error creating table:", error);
    }
};

module.exports = { db, tokenKey };
