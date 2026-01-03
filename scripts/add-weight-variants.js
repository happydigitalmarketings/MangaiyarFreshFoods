const mongoose = require('mongoose');

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mangaiyar-freshfoods';

const productSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  price: Number,
  mrp: Number,
  stock: Number,
  weight: String,
  weightVariants: [{
    weight: String,
    price: Number,
    mrp: Number,
    stock: Number
  }],
  images: [String],
  categories: [String],
  attributes: Object,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Define weight variants for grocery products
const weightVariantsMap = {
  'cucumber': [
    { weight: '100 g', price: 7, mrp: 10, stock: 50 },
    { weight: '250 g', price: 15, mrp: 21, stock: 40 },
    { weight: '500 g', price: 31, mrp: 42, stock: 30 },
    { weight: '1 kg', price: 134, mrp: 177, stock: 20 }
  ],
  'coriander': [
    { weight: '100 g', price: 7, mrp: 10, stock: 50 },
    { weight: '250 g', price: 15, mrp: 21, stock: 40 },
    { weight: '500 g', price: 31, mrp: 42, stock: 30 },
    { weight: '1 kg', price: 134, mrp: 177, stock: 20 }
  ],
  'eggs': [
    { weight: '6 pcs', price: 45, mrp: 60, stock: 50 },
    { weight: '12 pcs', price: 85, mrp: 120, stock: 40 },
    { weight: '24 pcs', price: 160, mrp: 220, stock: 30 },
    { weight: '30 pcs', price: 200, mrp: 280, stock: 20 }
  ],
  'apples': [
    { weight: '250 g', price: 50, mrp: 65, stock: 40 },
    { weight: '500 g', price: 95, mrp: 130, stock: 35 },
    { weight: '1 kg', price: 180, mrp: 250, stock: 25 }
  ],
  'bananas': [
    { weight: '250 g', price: 12, mrp: 15, stock: 60 },
    { weight: '500 g', price: 20, mrp: 30, stock: 50 },
    { weight: '1 kg', price: 38, mrp: 55, stock: 40 }
  ]
};

async function addWeightVariants() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const [keyword, variants] of Object.entries(weightVariantsMap)) {
      const result = await Product.updateMany(
        { title: { $regex: keyword, $options: 'i' } },
        { weightVariants: variants },
        { multi: true }
      );
      
      console.log(`Updated ${result.modifiedCount} products matching "${keyword}"`);
    }

    console.log('Weight variants added successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addWeightVariants();
