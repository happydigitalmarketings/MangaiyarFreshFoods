// pages/api/products/index.js
import connectDB from '../../../lib/db';
import Product from '../../../models/Product';
import { getUserFromReq } from '../_utils';

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { page = 1, limit = 12, q } = req.query;
      const query = q && q.length >= 3 ? { $text: { $search: q } } : {};

      // Ensure Product model is properly imported
      if (!Product || !Product.find) {
        throw new Error('Product model not properly initialized');
      }

      const products = await Product.find(query)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .sort({ order: 1, createdAt: -1 })
        .lean();
      
      res.json(products);
      return;
    }

    if (req.method === 'POST') {
      const user = await getUserFromReq(req);
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate required fields
      const { title, price } = req.body;
      if (!title || !price) {
        return res.status(400).json({ message: 'Title and price are required' });
      }

      // Generate slug if not provided
      if (!req.body.slug) {
        req.body.slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const created = await Product.create(req.body);
      res.status(201).json(created);
      return;
    }

    res.status(405).end();
  } catch (error) {
    console.error('Products API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
