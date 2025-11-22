import connectDB from '../../lib/db';
import Banner from '../../models/Banner';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    // Prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    await connectDB();

    const banners = await Banner.find({ active: true }).sort({ order: 1 }).lean();
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Error fetching banners' });
  }
}
