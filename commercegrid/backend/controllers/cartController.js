const { CartItem, Product } = require('../models');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product', attributes: ['title', 'price', 'images', 'stock', 'availability', 'id', 'slug'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available.' });
    }

    let item = await CartItem.findOne({ where: { userId: req.user.id, productId } });
    if (item) {
      item.quantity += parseInt(quantity);
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: 'Cannot add more. Insufficient stock.' });
      }
      await item.save();
    } else {
      item = await CartItem.create({ userId: req.user.id, productId, quantity: parseInt(quantity) });
    }

    const fullItem = await CartItem.findByPk(item.id, {
      include: [{ model: Product, as: 'product', attributes: ['title', 'price', 'images', 'stock', 'availability', 'id', 'slug'] }]
    });

    res.json({ success: true, message: 'Added to cart.', data: fullItem });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:id
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const product = await Product.findByPk(item.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available.' });
    }

    item.quantity = parseInt(quantity);
    await item.save();

    const fullItem = await CartItem.findByPk(item.id, {
      include: [{ model: Product, as: 'product', attributes: ['title', 'price', 'images', 'stock', 'availability', 'id', 'slug'] }]
    });

    res.json({ success: true, message: 'Cart updated.', data: fullItem });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:id
exports.removeFromCart = async (req, res, next) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }
    await item.destroy();
    res.json({ success: true, message: 'Removed from cart.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    await CartItem.destroy({ where: { userId: req.user.id } });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};
