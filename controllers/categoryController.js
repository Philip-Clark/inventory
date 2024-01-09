const Category = require('../models/Category');
const Item = require('../models/Item');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Category.
exports.category_list = function (req, res, next) {
  Category.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('category_list', {
        title: 'Category List',
        category_list: list_categories,
      });
    });
};

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
  res.render('category_form', { title: 'Create Category' });
};

// Handle Category create on POST.
exports.category_create_post = [
  body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Category description required').trim().isLength({ min: 1 }).escape(),

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
      });
      return;
    } else {
      await category.save();
      res.redirect(category.url);
    }
  }),
];

exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect('/catalog/categories');
      }
      // Successful, so render.
      res.render('category_delete', {
        title: 'Delete Category',
        category: results.category,
      });
    }
  );
};

// Delete post
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (items.length > 0) {
    res.render('category_delete', {
      title: 'Delete Category',
      category: category,
      items: items,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect('/catalog/categories');
  }
});

// Update get
exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id, function (err, category) {
    if (err) {
      return next(err);
    }
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
    });
  });
};

// Update post
exports.category_update_post = [
  body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Category description required').trim().isLength({ min: 1 }).escape(),

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
      });
      return;
    } else {
      await category.save();
      res.redirect(category.url);
    }
  }),
];
