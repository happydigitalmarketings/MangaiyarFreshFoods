const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mangaiyar-freshfoods';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  mrp: Number,
  stock: { type: Number, default: 0 },
  weight: { type: String },
  weightVariants: Array,
  images: [String],
  categories: [String],
  attributes: Object,
  order: { type: Number, default: 1, index: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// List of saree-related categories to remove
const sareeCategories = [
//   'Kasavu Sarees',
//   'Tissue Sarees',
//   'Silk',
//   'Wedding',
//   'Traditional',
//   'Festival',
//   'Namaz',
//   'Handloom Sarees',
//   'silk',
//   'wedding',
//   'traditional',
//   'festival',
//   'namaz',
//   'Handloom'
];

async function removeSareeCategories() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    
    let updatedCount = 0;
    let totalRemoved = 0;
    
    for (const product of products) {
      if (product.categories && product.categories.length > 0) {
        const originalLength = product.categories.length;
        
        // Filter out saree categories
        product.categories = product.categories.filter(cat => 
          !sareeCategories.includes(cat)
        );
        
        const removed = originalLength - product.categories.length;
        
        if (removed > 0) {
          await Product.updateOne(
            { _id: product._id },
            { categories: product.categories }
          );
          updatedCount++;
          totalRemoved += removed;
          console.log(`✓ ${product.title}: Removed ${removed} saree categor${removed > 1 ? 'ies' : 'y'}`);
          console.log(`  Remaining categories: ${product.categories.join(', ') || 'None'}`);
        }
      }
    }
    
    console.log(`\n✓ Completed!`);
    console.log(`Updated ${updatedCount} products`);
    console.log(`Removed ${totalRemoved} total saree category references`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

removeSareeCategories();
