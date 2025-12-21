// scripts/migrate-order-field.js
// This script adds the 'order' field to all existing products

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });

async function migrateOrderField() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI not defined');
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database...');

    const Product = (await import('../models/Product.js')).default;

    // Update all products to order 1
    const result = await Product.updateMany(
      {},
      { $set: { order: 1 } }
    );

    console.log(`✓ Migration complete!`);
    console.log(`  - Matched: ${result.matchedCount} products`);
    console.log(`  - Modified: ${result.modifiedCount} products`);

    // Verify
    const allProducts = await Product.find({}, { title: 1, order: 1 }).limit(5);
    console.log(`\n✓ Sample of products after migration:`);
    allProducts.forEach(p => console.log(`  - ${p.title}: order=${p.order}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateOrderField();
