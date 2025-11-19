import connectDB from '../../../lib/db';
import Contact from '../../../models/Contact';
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
      const { status, search, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build filter
      const filter = {};
      if (status && status !== 'all') {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
        ];
      }

      // Get contacts
      const [contacts, total] = await Promise.all([
        Contact.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Contact.countDocuments(filter),
      ]);

      return res.status(200).json({
        contacts,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body;

      if (!id || !status || !['new', 'read', 'replied'].includes(status)) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      await Contact.findByIdAndUpdate(id, { status });
      return res.status(200).json({ message: 'Status updated' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'ID required' });
      }

      await Contact.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Contact deleted' });
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Admin contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
