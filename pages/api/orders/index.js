// pages/api/orders/index.js
import connectDB from '../../../lib/db';
import Order from '../../../models/Order';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await connectDB();
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const orders = await Order.find({})
      .populate('items.product', 'title price images weight')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}
