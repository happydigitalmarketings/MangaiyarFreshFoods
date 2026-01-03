const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mangaiyar-freshfoods';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  mrp: Number,
  stock: { type: Number, default: 0 },
  weight: { type: String },
  weightVariants: [{
    weight: { type: String },
    price: { type: Number },
    mrp: { type: Number },
    stock: { type: Number, default: 0 }
  }],
  images: [String],
  categories: [String],
  attributes: Object,
  order: { type: Number, default: 1, index: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

async function checkApple() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const apple = await Product.findOne({ title: { $regex: 'apple', $options: 'i' } });
    
    if (apple) {
      console.log('\nApple Product Found:');
      console.log('Title:', apple.title);
      console.log('Weight Variants Count:', apple.weightVariants ? apple.weightVariants.length : 0);
      console.log('Weight Variants:', JSON.stringify(apple.weightVariants, null, 2));
    } else {
      console.log('No apple product found');
      // List all products
      const all = await Product.find({}).limit(5);
      console.log('\nAll products (first 5):');
      all.forEach(p => console.log('- ', p.title));
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkApple();
