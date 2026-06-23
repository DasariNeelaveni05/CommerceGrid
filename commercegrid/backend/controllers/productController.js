const { Op } = require('sequelize');
const { sequelize, Product, Category, User, Review } = require('../models');
const cloudinaryService = require('../services/cloudinaryService');

// Calculate average rating helper
const updateProductRating = async (productId) => {
  try {
    const stats = await Review.findOne({
      where: { productId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
      ],
      raw: true,
    });

    const avgRating = stats && stats.avgRating ? Math.round(parseFloat(stats.avgRating) * 10) / 10 : 0;
    const reviewCount = stats && stats.reviewCount ? parseInt(stats.reviewCount) : 0;

    await Product.update(
      { averageRating: avgRating, reviewCount: reviewCount },
      { where: { id: productId } }
    );
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      q,
      category,
      brand,
      condition,
      minPrice,
      maxPrice,
      minRating,
      sort = 'newest',
      featured,
    } = req.query;

    const filter = { isActive: true, isSold: false };

    // Search query
    if (q) {
      filter[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { brand: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    // Category filter (slug or id)
    if (category) {
      const catWhere = category.length === 36 ? { id: category } : { slug: category };
      const cat = await Category.findOne({ where: catWhere });
      if (cat) {
        filter.categoryId = cat.id;
      } else {
        filter.categoryId = null; // force empty
      }
    }

    // Brand filter
    if (brand) {
      filter.brand = { [Op.like]: `%${brand}%` };
    }

    // Condition filter
    if (condition) {
      filter.condition = condition;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filter.price[Op.lte] = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      filter.averageRating = { [Op.gte] : parseFloat(minRating) };
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Sorting
    const sortMap = {
      newest: [['createdAt', 'DESC']],
      oldest: [['createdAt', 'ASC']],
      price_asc: [['price', 'ASC']],
      price_desc: [['price', 'DESC']],
      popular: [['viewsCount', 'DESC']],
      rating: [['averageRating', 'DESC']],
      featured: [['isFeatured', 'DESC'], ['createdAt', 'DESC']],
    };
    const sortOption = sortMap[sort] || [['createdAt', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: products, count: total } = await Product.findAndCountAll({
      where: filter,
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug', 'icon', 'color'] },
        { model: User, as: 'seller', attributes: ['firstName', 'lastName', 'email', 'avatar'] }
      ],
      order: sortOption,
      offset,
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/search
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 6 } = req.query;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const products = await Product.findAll({
      where: {
        isActive: true,
        isSold: false,
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { brand: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
      limit: parseInt(limit),
    });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = id.length === 36 ? { id } : { slug: id };

    const product = await Product.findOne({
      where: { ...where, isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug', 'icon', 'color'] },
        { model: User, as: 'seller', attributes: ['firstName', 'lastName', 'email', 'avatar'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Increment views
    await product.increment('viewsCount');

    // Fetch reviews
    const reviews = await Review.findAll({
      where: { productId: product.id },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatar', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    // Related products
    const related = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id },
        isActive: true,
        isSold: false,
      },
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
      limit: 6,
    });

    res.json({ success: true, data: { ...product.toJSON(), reviews, related } });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      title, description, price, originalPrice,
      brand, condition, categoryId, tags, city, state,
      isFeatured, stock, availability,
    } = req.body;

    const productData = {
      title,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      brand,
      condition,
      categoryId,
      tags: tags ? JSON.parse(tags) : [],
      city,
      state,
      isFeatured: isFeatured === 'true',
      stock: stock ? parseInt(stock) : 1,
      availability: availability || 'in_stock',
      sellerId: req.user.id,
    };

    const product = await Product.create(productData);

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageUploads = req.files.slice(0, 5).map((file, idx) =>
        cloudinaryService.uploadImage(file.buffer, 'commercegrid/products', file.mimetype).then((result) => ({
          url: result.url,
          publicId: result.publicId,
          isPrimary: idx === 0,
          order: idx,
        }))
      );
      const uploadedImages = await Promise.allSettled(imageUploads);
      product.images = uploadedImages
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);
      await product.save();
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const allowedFields = [
      'title', 'description', 'price', 'originalPrice', 'brand',
      'condition', 'categoryId', 'tags', 'city', 'state',
      'isFeatured', 'isActive', 'isSold', 'stock', 'availability',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'price' || field === 'originalPrice') {
          product[field] = parseFloat(req.body[field]);
        } else if (field === 'tags' && typeof req.body[field] === 'string') {
          product[field] = JSON.parse(req.body[field]);
        } else if (field === 'isFeatured' || field === 'isActive' || field === 'isSold') {
          product[field] = req.body[field] === 'true' || req.body[field] === true;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const remaining = 5 - (product.images || []).length;
      if (remaining > 0) {
        const uploads = req.files.slice(0, remaining).map((file, idx) =>
          cloudinaryService.uploadImage(file.buffer, 'commercegrid/products', file.mimetype).then((r) => ({
            url: r.url,
            publicId: r.publicId,
            isPrimary: (product.images || []).length === 0 && idx === 0,
            order: (product.images || []).length + idx,
          }))
        );
        const results = await Promise.allSettled(uploads);
        const newImages = [...(product.images || [])];
        results.filter((r) => r.status === 'fulfilled').forEach((r) => newImages.push(r.value));
        product.images = newImages;
      }
    }

    await product.save();
    res.json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Delete images from Cloudinary
    for (const img of (product.images || [])) {
      await cloudinaryService.deleteImage(img.publicId);
    }

    await product.destroy();
    await Review.destroy({ where: { productId: req.params.id } });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id/images/:imageId
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const currentImages = product.images || [];
    const image = currentImages.find((img) => img.publicId === req.params.imageId);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

    await cloudinaryService.deleteImage(image.publicId);
    product.images = currentImages.filter((img) => img.publicId !== req.params.imageId);
    await product.save();

    res.json({ success: true, message: 'Image deleted.', data: product });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id/reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const existing = await Review.findOne({ where: { productId, userId: req.user.id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
    }

    const review = await Review.create({
      productId,
      userId: req.user.id,
      rating: parseInt(rating),
      comment,
    });

    await updateProductRating(productId);
    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'avatar'] }]
    });

    res.status(201).json({ success: true, message: 'Review submitted.', data: fullReview });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalProducts, totalCategories, totalUsers, featuredCount] = await Promise.all([
      Product.count({ where: { isActive: true } }),
      Category.count({ where: { isActive: true } }),
      User.count(),
      Product.count({ where: { isFeatured: true, isActive: true } }),
    ]);

    // Top categories by product count
    const topCategories = await Product.findAll({
      where: { isActive: true },
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('Product.id')), 'count']
      ],
      group: ['categoryId'],
      include: [{ model: Category, as: 'category', attributes: ['name', 'icon'] }],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
    });

    const formattedCats = topCategories.map((item) => ({
      id: item.categoryId,
      name: item.category ? item.category.name : 'Unknown',
      icon: item.category ? item.category.icon : '📦',
      count: parseInt(item.getDataValue('count')),
    }));

    res.json({
      success: true,
      data: { totalProducts, totalCategories, totalUsers, featuredCount, topCategories: formattedCats },
    });
  } catch (error) {
    next(error);
  }
};
