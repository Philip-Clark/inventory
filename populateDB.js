#! /usr/bin/env node

console.log('🗒️  This script populates a database with categories and items');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require('./models/Item');
const Category = require('./models/Category');

const categories = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log('🪲  Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('🪲  Debug: Should be connected?');
  await clearCollections();
  await createCategories();
  await createItems();
  console.log('🪲  Debug: Closing mongoose');
  mongoose.connection.close();
}

async function clearCollections() {
  const collections = mongoose.connection.collections;
  console.log(`💣 Clearing collections`);
  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({});
      console.log(`💣 Cleared Collection: ${collection.name}`); // an empty mongodb selector object ({}) must be passed as the filter argument
    })
  );
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(name) {
  const category = new Category({ name: name, description: `a category for ${name} items` });
  await category.save();
  categories.push(category);
  console.log(`✔️  Added category: ${name}`);
}

async function itemCreate(name, description, categories, price, stock) {
  const itemDetails = {
    name: name,
    description: description,
    categories: categories,
    price: price,
    stock: stock,
    image: 'https://placehold.co/800x600/343434/fff/png',
  };

  const item = new Item(itemDetails);
  await item.save();
  console.log(`✔️  Added item: ${name}`);
}

async function createCategories() {
  console.log('➕ Adding categories');
  await Promise.all([
    categoryCreate('Furniture'),
    categoryCreate('Electronics'),
    categoryCreate('Clothing'),
    categoryCreate('Toys'),
    categoryCreate('Books'),
    categoryCreate('Tools'),
    categoryCreate('Appliances'),
    categoryCreate('Other'),
  ]);
}

async function createItems() {
  console.log('➕ Adding items');
  await Promise.all([
    itemCreate('Chair', 'A comfortable chair', [categories[0], categories[2]], 150, 8),
    itemCreate('Table', 'A sturdy table', [categories[0], categories[3]], 250, 4),
    itemCreate('Couch', 'A comfy couch', [categories[0], categories[3]], 350, 1),
    itemCreate('Lamp', 'A bright lamp', [categories[0], categories[4]], 60, 15),
    itemCreate('TV', 'A big TV', [categories[1], categories[4]], 600, 2),
    itemCreate('Radio', 'A small radio', [categories[1], categories[5]], 60, 8),
    itemCreate('Computer', 'A fast computer', [categories[1], categories[5]], 1200, 1),
    itemCreate('Phone', 'A smart phone', [categories[1], categories[6]], 600, 4),
    itemCreate('Shirt', 'A nice shirt', [categories[2], categories[7]], 60, 8),
    itemCreate('Pants', 'A nice pair of pants', [categories[2], categories[7]], 60, 8),
    itemCreate('Dress', 'A nice dress', [categories[2], categories[7]], 60, 8),
    itemCreate('Hat', 'A nice hat', [categories[2], categories[7]], 60, 8),
    itemCreate('Socks', 'A nice pair of socks', [categories[2], categories[7]], 60, 8),
    itemCreate('Shoes', 'A nice pair of shoes', [categories[2], categories[7]], 60, 8),
    itemCreate('Ball', 'A nice ball', [categories[3], categories[7]], 60, 8),
    itemCreate('Doll', 'A nice doll', [categories[3], categories[7]], 60, 8),
    itemCreate('Truck', 'A nice truck', [categories[3], categories[7]], 60, 8),
  ]);
}
