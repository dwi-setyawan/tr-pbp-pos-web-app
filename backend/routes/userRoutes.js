import express from "express";
import { 
    createCashier,
    getCashiers, 
    getCashierById, 
    updateCashier, 
    deleteCashier 
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Rute untuk admin wajib login (proses verifikasi)
router.get('/', verifyToken, isAdmin, getCashiers);
router.post("/", verifyToken, isAdmin, createCashier);
router.get('/:id', verifyToken, isAdmin, getCashierById);
router.put('/:id', verifyToken, isAdmin, updateCashier);
router.delete('/:id', verifyToken, isAdmin, deleteCashier);

export default router;