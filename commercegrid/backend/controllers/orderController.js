const { sequelize, Order, OrderItem, Product, CartItem, User } = require('../models');

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { shippingAddress, contactPhone } = req.body;

    // Get cart items
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
      transaction,
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // Verify stock and calculate total
    for (const item of cartItems) {
      const product = item.product;
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'One of the products in your cart no longer exists.' });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.title}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create Order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      paymentStatus: 'paid', // Simulate successful payment
      orderStatus: 'pending',
      shippingAddress,
      contactPhone,
    }, { transaction });

    // Create Order Items and update product stock
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        ...itemData,
      }, { transaction });

      // Decrement stock
      const product = await Product.findByPk(itemData.productId, { transaction });
      product.stock -= itemData.quantity;
      if (product.stock === 0) {
        product.availability = 'out_of_stock';
      }
      await product.save({ transaction });
    }

    // Clear cart
    await CartItem.destroy({ where: { userId: req.user.id }, transaction });

    await transaction.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['title', 'images'] }]
        }
      ]
    });

    res.status(201).json({ success: true, message: 'Order created successfully.', data: fullOrder });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['title', 'images'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['title', 'images'] }]
        }
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/admin (Admin list all)
exports.getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['title', 'images'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status (Admin update status)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({ success: true, message: 'Order status updated successfully.', data: order });
  } catch (error) {
    next(error);
  }
};
