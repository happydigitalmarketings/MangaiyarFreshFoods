import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  items: [{ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, 
    qty: Number, 
    price: Number,
    // Store product details at order time for permanent record
    productTitle: String,
    productImage: String
  }],
  total: { 
    type: Number, 
    required: true 
  },
  shippingAddress: {
    type: Object,
    required: true
  },
  paymentMethod: { 
    type: String,
    required: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
