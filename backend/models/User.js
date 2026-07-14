import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Memastikan format email valid
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("kasir", "admin"), // Menyesuaikan enum milikmu
        defaultValue: "kasir",
    }
}, {
    timestamps: true, // Otomatis membuat createdAt & updatedAt
});

export default User;