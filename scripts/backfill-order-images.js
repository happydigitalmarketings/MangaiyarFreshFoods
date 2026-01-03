// scripts/backfill-order-images.js
// This script backfills productTitle and productImage for existing orders

require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/minikki';

// Define schemas inline to avoid import issues
const OrderSchema = new mongoose.Schema({
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: Number,
    price: Number,
    productTitle: String,
    productImage: String
  }],
  total: { type: Number, required: true },
  shippingAddress: { type: Object, required: true },
  paymentMethod: { type: String, required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: [String]
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function backfillOrderImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Find all orders where items don't have productTitle or productImage
    const ordersToUpdate = await Order.find({
      $or: [
        { 'items.productTitle': { $exists: false } },
        { 'items.productImage': { $exists: false } }
      ]
    });

    console.log(`Found ${ordersToUpdate.length} orders to backfill`);

    if (ordersToUpdate.length === 0) {
      console.log('No orders to update');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;
    let skipped = 0;

    for (const order of ordersToUpdate) {
      let orderChanged = false;

      // Process each item
      for (const item of order.items) {
        // Skip if already has both fields
        if (item.productTitle && item.productImage) {
          continue;
        }

        // Try to fetch product data
        if (item.product) {
          try {
            const product = await Product.findById(item.product).select('title images');
            if (product) {
              if (!item.productTitle) item.productTitle = product.title;
              if (!item.productImage) item.productImage = product.images?.[0] || null;
              orderChanged = true;
              console.log(`  ✓ Updated item with product: ${product.title}`);
            } else {
              console.log(`  ⚠ Product not found: ${item.product}`);
              skipped++;
            }
          } catch (err) {
            console.warn(`  ⚠ Error fetching product ${item.product}:`, err.message);
            skipped++;
          }
        }
      }

      // Save if changed
      if (orderChanged) {
        try {
          await order.save();
          updated++;
          console.log(`✓ Updated order ${order._id}`);
        } catch (err) {
          console.error(`✗ Error saving order ${order._id}:`, err.message);
        }
      }
    }

    console.log(`\n✓ Backfill complete!`);
    console.log(`  - Updated: ${updated} orders`);
    console.log(`  - Skipped (product not found): ${skipped} items`);

    await mongoose.connection.close();
    console.log('✓ Database connection closed');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

backfillOrderImages();
