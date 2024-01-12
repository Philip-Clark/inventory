const Item = require('../models/Item');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { checkAdminPassword, incorrectPassword } = require('../helpers/checkAdminPassword');

// Display list of all item.
exports.index = asyncHandler(async (req, res, next) => {
  const all_items = await Item.find()
    .sort([['name', 'ascending']])
    .exec();
  //Successful, so render
  res.render('item_list', {
    title: 'Index',
    items: all_items,
  });
});

// Display list of all item.
exports.item_list = asyncHandler(async (req, res, next) => {
  const all_items = await Item.find()
    .sort([['name', 'ascending']])
    .exec();
  //Successful, so render
  res.render('item_list', {
    title: 'Index',
    item_list: all_items,
  });
});

// Display detail page for a specific item.
exports.item_detail = async function (req, res, next) {
  const item = await Item.findById(req.params.id).populate('categories').exec();

  if (item === null) {
    // No results.
    const error = new Error(`Item not found`);
    return next(error);
  }
  // Successful, so render.
  res.render('item_detail', {
    title: 'Item Detail',
    item: item,
  });
};

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().exec();
  res.render('item_form', {
    title: 'Create item',
    categories: categories,
    actionText: 'Create',
  });
});

// Handle item create on POST.
exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
    }
    next();
  },
  body('name', 'item name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'item description required').trim().isLength({ min: 1 }).escape(),
  body('price', 'item price required').isNumeric().escape(),
  body('stock', 'item stock required').isNumeric().escape(),
  body('categories.*').escape(),
  body('password', 'Incorrect password').custom((value) => value === process.env.ADMIN_PASSWORD),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      categories: req.body.category,
      image: 'https://placehold.co/800x600/343434/fff/png',
    });
    const categories = await Category.find().exec();

    if (!errors.isEmpty()) {
      // Mark our selected genres as checked.
      categories.forEach((category) => {
        if (item.categories.includes(category._id)) category.checked = 'true';
      });
      // Success.
      res.render('item_form', {
        title: 'Update item',
        actionText: 'Update',
        item: item,
        categories: categories,
      });
      return;
    }
    await item.save();
    res.redirect(item.url);
  }),
];

exports.item_delete_get = [
  asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).exec();

    if (item == null) {
      // No results.
      res.redirect('/catalog/items');
    }
    // Successful, so render.
    res.render('item_delete', {
      title: 'Delete item',
      item: item,
    });
  }),
];
// Delete post
exports.item_delete_post = [
  body('password', 'Incorrect password').custom((value) => value === process.env.ADMIN_PASSWORD),
  asyncHandler(async (req, res, next) => {
    const [item] = await Promise.all([Item.findById(req.params.id).exec()]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('item_delete', {
        title: 'Delete item',
        item: item,
        errors: errors.array(),
      });
      return;
    }

    await Item.findByIdAndDelete(item._id);
    res.redirect('/catalog');
  }),
];

// Update get
exports.item_update_get = async function (req, res, next) {
  const [item, categories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().exec(),
  ]);
  if (item == null) {
    // No results.
    const error = new Error('item not found');
    err.status = 404;
    return next(error);
  }

  // Mark our selected genres as checked.
  categories.forEach((category) => {
    if (item.categories.includes(category._id)) category.checked = 'true';
  });
  // Success.
  res.render('item_form', {
    title: 'Update item',
    actionText: 'Update',
    item: item,
    categories: categories,
  });
};

// Update post
exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
    }
    next();
  },
  body('name', 'item name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'item description required').trim().isLength({ min: 1 }).escape(),
  body('price', 'item price required').isNumeric().escape(),
  body('stock', 'item stock required').isNumeric().escape(),
  body('categories.*').escape(),
  body('password', 'Incorrect password').custom((value) => value === process.env.ADMIN_PASSWORD),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const categories = await Category.find().exec();
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      categories: req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // Mark our selected genres as checked.
      categories.forEach((category) => {
        if (item.categories.includes(category._id)) category.checked = 'true';
      });
      // Success.
      res.render('item_form', {
        title: 'Update item',
        actionText: 'Update',
        item: item,
        categories: categories,
      });
      return;
    }

    await Item.findByIdAndUpdate(req.params.id, item);
    res.redirect(item.url);
  }),
];
