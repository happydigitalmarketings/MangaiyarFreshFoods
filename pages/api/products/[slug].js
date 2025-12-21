// pages/api/products/[slug].js
import connectDB from '../../../lib/db';
import Product from '../../../models/Product';
import { getUserFromReq } from '../_utils';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectDB();
  const { slug } = req.query;
  // allow either slug or Mongo ObjectId in the route param
  const query = mongoose.Types.ObjectId.isValid(slug) ? { _id: slug } : { slug };

  if (req.method === 'GET') {
    const product = await Product.findOne(query).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
    return;
  }

  const user = await getUserFromReq(req);
  if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'PUT') {
    const updated = await Product.findOneAndUpdate(query, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
    return;
  }

  if (req.method === 'DELETE') {
    const deleted = await Product.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
    return;
  }

  res.status(405).end();
};

export default handler;