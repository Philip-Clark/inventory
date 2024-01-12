const Category = require('../models/Category');
const Item = require('../models/Item');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Category.

exports.category_list = asyncHandler(async (req, res, next) => {
  const categories = await Category.find()
    .sort([['name', 'ascending']])
    .exec();
  //Successful, so render
  res.render('category_list', {
    title: 'Category List',
    categories: categories,
  });
});

// Display detail page for a specific Category.
exports.category_detail = async function (req, res, next) {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ categories: req.params.id }).exec(),
  ]);

  if (category == null) {
    // No results.
    const error = new Error('Category not found');
    err.status = 404;
    return next(error);
  }
  // Successful, so render.
  res.render('category_detail', {
    title: 'Category Detail',
    category: category,
    itemsInCategory: itemsInCategory,
  });
};

// Display Category create form on GET.
exports.category_create_get = function (req, res, next) {
  res.render('category_form', { title: 'Create Category', actionText: 'Create' });
};

// Handle Category create on POST.
exports.category_create_post = [
  body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Category description required').trim().isLength({ min: 1 }).escape(),
  body('password', 'Incorrect password').custom((value) => value === process.env.ADMIN_PASSWORD),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Create Category',
        category: category,
        errors: errors.array(),
        actionText: 'Create',
      });
      return;
    }

    await category.save();
    res.redirect(category.url);
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ categories: req.params.id }).exec(),
  ]);
  if (category == null) {
    // No results.
    res.redirect('/catalog/categories');
  }
  // Successful, so render.
  res.render('category_delete', {
    title: 'Delete Category',
    category: category,
    items: items,
  });
});

// Delete post
exports.category_delete_post = [
  body('password', 'Incorrect password').custom((value) => value === process.env.ADMIN_PASSWORD),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const [category, items] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Item.find({ categories: req.params.id }).exec(),
    ]);
    if (!errors.isEmpty()) {
      res.render('category_delete', {
        title: 'Delete Category',
        category: category,
        items: items,
        errors: errors.array(),
      });
    }

    items.forEach((item) => {
      console.log(item);
      item.categories = item.categories.filter((category) => category.id !== req.params.id);
      item.save();
    });
    Category.findByIdAndDelete(req.params.id).exec();
    res.redirect('/catalog/categories');
  }),
];

// Update get
exports.category_update_get = async function (req, res, next) {
  const category = await Category.findById(req.params.id).exec();
  if (category == null) {
    // No results.
    const error = new Error('Category not found');
    err.status = 404;
    return next(error);
  }
  // Success.
  res.render('category_form', {
    title: 'Update Category',
    category: category,
    actionText: 'Update',
  });
};

// Update post
exports.category_update_post = [
  body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Category description required').trim().isLength({ min: 1 }).escape(),
  body('password', 'Incorrect password').custom((value) => value === process.env.ADMIN_PASSWORD),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Create Category',
        category: category,
        errors: errors.array(),
        actionText: 'Update',
      });
      return;
    }
    await Category.findByIdAndUpdate(req.params.id, category);
    res.redirect(category.url);
  }),
];
