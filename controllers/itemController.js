const Item = require('../models/Item');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');

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
exports.item_create_get = function (req, res, next) {
  res.render('item_form', { title: 'Create item' });
};

// Handle item create on POST.
exports.item_create_post = [
  body('name', 'item name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'item description required').trim().isLength({ min: 1 }).escape(),
  body('category', 'item category required').trim().isLength({ min: 1 }).escape(),
  body('price', 'item price required').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('item_form', {
        title: 'Create item',
        item: item,
        errors: errors.array(),
      });
    } else {
      await Item.save();
      res.redirect(item.url);
    }
  }),
];

exports.item_delete_get = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        Item.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        res.redirect('/catalog/items');
      }
      // Successful, so render.
      res.render('item_delete', {
        title: 'Delete item',
        item: results.item,
      });
    }
  );
};

// Delete post
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const [item, categories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find({ item: req.params.id }).exec(),
  ]);

  if (items.length > 0) {
    res.render('item_delete', {
      title: 'Delete item',
      item: item,
      items: items,
    });
  } else {
    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect('/catalog/items');
  }
});

// Update get
exports.item_update_get = function (req, res, next) {
  Item.findById(req.params.id, function (err, item) {
    if (err) {
      return next(err);
    }
    if (item == null) {
      // No results.
      const error = new Error('item not found');
      err.status = 404;
      return next(error);
    }
    // Success.
    res.render('item_form', {
      title: 'Update item',
      item: item,
    });
  });
};

// Update post
exports.item_update_post = [
  body('name', 'item name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'item description required').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = new item({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('item_form', {
        title: 'Create item',
        item: item,
        errors: errors.array(),
      });
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];
