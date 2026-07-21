import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Product = db.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Nama menu tidak boleh kosong!"
            }
        }
    },
    price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
            min: {
                args: [1000],
                msg: "Harga minimal adalah Rp 1.000 dan tidak boleh minus!"
            }
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: [0], 
                msg: "Stok tidak boleh minus!"
            }
        }
    },
    category: {
        type: DataTypes.ENUM("coffee", "non-coffee"),
        defaultValue: "coffee",
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, 
    }
}, {
    timestamps: true,
});

export default Product;