const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//mongoose schema with name, description, url
const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  image: String,
});

ItemSchema.virtual('url').get(function () {
  return `/catalog/item/${this._id}`;
});

//export the model
module.exports = mongoose.model('Item', ItemSchema);
