import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

const removeUploadedFile = (file) => {
    if (file) {
        const filePath = path.join("uploads", file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// Product aktif sj
export const getProducts = async (req, res) => {
    try {
        const { all } = req.query;
        const whereCondition = all === "true" ? {} : { isActive: true };

        const products = await Product.findAll({
            where: whereCondition,
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Semua Produk 
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tmbh Produk
export const createProduct = async (req, res) => {
    try {
        const { name, price, stock, category } = req.body;
        const imageName = req.file ? req.file.filename : null;
        // Ambil nama gambar 
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice < 1000) {
            removeUploadedFile(req.file);
            return res.status(400).json({ 
                message: "Harga produk minimal harus Rp 1.000 dan tidak boleh minus!" 
            });
        }

        const numericStock = Number(stock);
        if (isNaN(numericStock) || numericStock < 0) {
            removeUploadedFile(req.file);
            return res.status(400).json({ 
                message: "Stok produk tidak boleh minus!" 
            });
        }

        const newProduct = await Product.create({
            name: name,
            price: price,
            stock: stock,
            category: category,
            image: imageName,
            isActive: true
        });

        res.status(201).json({
            message: "Produk berhasil ditambahkan",
            data: newProduct
        });
    } catch (error) {
        removeUploadedFile(req.file);
        res.status(400).json({ message: error.message });
    }
};

// Update produk
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            removeUploadedFile(req.file);
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        const { name, price, stock, category, isActive } = req.body;

        if (price !== undefined) {
            const numericPrice = Number(price);
            if (isNaN(numericPrice) || numericPrice < 1000) {
                removeUploadedFile(req.file);
                return res.status(400).json({ 
                    message: "Harga produk minimal harus Rp 1.000 dan tidak boleh minus!" 
                });
            }
            product.price = numericPrice;
        }

        if (stock !== undefined) {
            const numericStock = Number(stock);
            if (isNaN(numericStock) || numericStock < 0) {
                removeUploadedFile(req.file);
                return res.status(400).json({ 
                    message: "Stok produk tidak boleh minus!" 
                });
            }
            product.stock = numericStock;
        }

        if (req.file) {
            if (product.image) {
                const oldImagePath = path.join("uploads", product.image);
                
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            product.image = req.file.filename;
        }

        if (name) product.name = name;
        if (category) product.category = category;
        if (isActive !== undefined) product.isActive = isActive;

        await product.save();

        res.status(200).json({
            message: "Produk berhasil diperbarui",
            data: product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Sfot delete 
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }
        product.isActive = false;
        await product.save();

        res.status(200).json({ 
            message: "Produk berhasil dinonaktifkan" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};