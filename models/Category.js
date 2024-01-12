const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//mongoose schema with name, description, url
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
});

CategorySchema.virtual('url').get(function () {
  return `/catalog/category/${this._id}`;
});

//export the model
module.exports = mongoose.model('Category', CategorySchema);
