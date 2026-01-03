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
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default 10 orders per page
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await Order.countDocuments({});

    // Fetch paginated orders
    const orders = await Order.find({})
      .populate('items.product', 'title price images weight')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}
