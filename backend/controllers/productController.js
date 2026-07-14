import Product from "../models/Product.js";

// 1. LIHAT SEMUA PRODUK (Bisa diakses Admin & Kasir)
export const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. LIHAT DETAIL PRODUK BERDASARKAN ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. TAMBAH PRODUK BARU (Khusus Admin)
export const createProduct = async (req, res) => {
    const { name, price, stock, category } = req.body;
    try {
        const newProduct = await Product.create({ name, price, stock, category });
        res.status(201).json({ message: "Produk berhasil ditambahkan", data: newProduct });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. UPDATE DATA PRODUK (Khusus Admin)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

        const { name, price, stock, category } = req.body;
        await product.update({ name, price, stock, category });
        
        res.status(200).json({ message: "Produk berhasil diperbarui", data: product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 5. HAPUS PRODUK (Khusus Admin)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });

        await product.destroy();
        res.status(200).json({ message: "Produk berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};