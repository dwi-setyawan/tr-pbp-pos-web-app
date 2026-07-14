import express from "express";
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../controllers/productController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua user yang login (Admin & Kasir) bisa melihat produk
router.get("/", verifyToken, getProducts);
router.get("/:id", verifyToken, getProductById);

// Hanya Admin yang bisa menambah, mengubah, dan menghapus produk
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;