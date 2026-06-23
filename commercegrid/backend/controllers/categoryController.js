const { Category, Product } = require('../models');

// GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = id.length === 36 ? { id } : { slug: id };
    
    const category = await Category.findOne({ where });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const productCount = await Product.count({
      where: { categoryId: category.id, isActive: true },
    });

    res.json({ success: true, data: { ...category.toJSON(), productCount } });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories — Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, description, order, parentId } = req.body;
    const category = await Category.create({ name, icon, color, description, order, parentId });
    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id — Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    await category.update(req.body);
    res.json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id — Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const productCount = await Product.count({ where: { categoryId: req.params.id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} products use this category.`,
      });
    }
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    await category.destroy();
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
