import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  mrp: Number,
  stock: { type: Number, default: 0 },
  weight: { type: String },
  weightVariants: [{
    weight: { type: String }, // e.g., "100 g", "250 g", "500 g", "1 kg"
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

// Create text index for search
ProductSchema.index({ title: 'text', description: 'text' }); 

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
