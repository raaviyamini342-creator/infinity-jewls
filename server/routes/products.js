const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, admin } = require('../middleware/auth');

// Get All Products
router.get('/', (req, res) => {
  try {
    const products = db.products.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
});

// Get Single Product
router.get('/:id', (req, res) => {
  try {
    const product = db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
  }
});

// Add Product (Admin only)
router.post('/', auth, admin, (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const newProduct = db.products.create({
      name,
      description: description || '',
      price: parseFloat(price),
      image: image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      category,
      stock: parseInt(stock || '10')
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
});

// Update Product (Admin only)
router.put('/:id', auth, admin, (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    
    const product = db.products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updated = db.products.updateById(req.params.id, {
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      image: image || product.image,
      category: category || product.category,
      stock: stock !== undefined ? parseInt(stock) : product.stock
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
});

// Delete Product (Admin only)
router.delete('/:id', auth, admin, (req, res) => {
  try {
    const deleted = db.products.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.', product: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
});

module.exports = router;
