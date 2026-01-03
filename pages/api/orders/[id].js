// pages/api/orders/[id].js
import connectDB from '../../../lib/db';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await Order.findById(id)
        .populate('items.product', 'title price images weight');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Error fetching order' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('items.product', 'title price images weight');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Error updating order' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const order = await Order.findByIdAndDelete(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: 'Error deleting order' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
