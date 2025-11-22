import connectDB from '../../../lib/db';
import Banner from '../../../models/Banner';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    await connectDB();

    // Verify admin
    const cookies = req.headers.cookie || '';
    const token = cookies.split('token=')[1] ? cookies.split('token=')[1].split(';')[0] : null;
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const banners = await Banner.find().sort({ order: 1 }).lean();
      // Ensure cta has a default value for frontend
      return res.status(200).json(banners.map(b => ({ ...b, cta: b.cta || 'Shop Now' })));
    }

    if (req.method === 'POST') {
      const { title, text, image, link, cta, order, active } = req.body;

      if (!title || !text || !image) {
        return res.status(400).json({ message: 'Title, text, and image are required' });
      }

      const banner = await Banner.create({
        title,
        text,
        image,
        link: link || '/',
        cta: cta || 'Shop Now',
        order: order || 0,
        active: active !== false,
      });

      return res.status(201).json(banner);
    }

    if (req.method === 'PATCH') {
        debugger;
      const { id, title, text, image, link, cta, order, active } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Banner ID is required' });
      }

      console.log('PATCH request received with:', { id, title, text, image, link, cta, order, active });

      // Fetch the existing banner
      let banner = await Banner.findById(id);
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      console.log('Existing banner:', banner);

      // Update fields
      if (title !== undefined) banner.title = title;
      if (text !== undefined) banner.text = text;
      if (image !== undefined) banner.image = image;
      if (link !== undefined) banner.link = link;
      if (cta !== undefined) {
        const ctaValue = typeof cta === 'string' ? cta.trim() : cta;
        banner.cta = ctaValue || 'Shop Now';
        console.log('Setting CTA to:', banner.cta);
      }
      if (order !== undefined) banner.order = order;
      if (active !== undefined) banner.active = active;
      banner.updatedAt = new Date();

      // Save the banner
      banner = await banner.save();

      console.log('Saved banner:', banner);
      console.log('Saved banner CTA:', banner.cta);

      return res.status(200).json(banner);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Banner ID is required' });
      }

      await Banner.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Banner deleted' });
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Banner API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
