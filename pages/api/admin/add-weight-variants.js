import connectDB from '../../lib/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const weightVariantsMap = {
      'cucumber': [
        { weight: '100 g', price: 7, mrp: 10, stock: 50 },
        { weight: '250 g', price: 15, mrp: 21, stock: 40 },
        { weight: '500 g', price: 31, mrp: 42, stock: 30 },
        { weight: '1 kg', price: 134, mrp: 177, stock: 20 }
      ],
      'coriander': [
        { weight: '100 g', price: 7, mrp: 10, stock: 50 },
        { weight: '250 g', price: 15, mrp: 21, stock: 40 },
        { weight: '500 g', price: 31, mrp: 42, stock: 30 },
        { weight: '1 kg', price: 134, mrp: 177, stock: 20 }
      ],
      'eggs': [
        { weight: '6 pcs', price: 45, mrp: 60, stock: 50 },
        { weight: '12 pcs', price: 85, mrp: 120, stock: 40 },
        { weight: '24 pcs', price: 160, mrp: 220, stock: 30 },
        { weight: '30 pcs', price: 200, mrp: 280, stock: 20 }
      ],
      'apples': [
        { weight: '250 g', price: 50, mrp: 65, stock: 40 },
        { weight: '500 g', price: 95, mrp: 130, stock: 35 },
        { weight: '1 kg', price: 180, mrp: 250, stock: 25 }
      ],
      'bananas': [
        { weight: '250 g', price: 12, mrp: 15, stock: 60 },
        { weight: '500 g', price: 20, mrp: 30, stock: 50 },
        { weight: '1 kg', price: 38, mrp: 55, stock: 40 }
      ]
    };

    let totalUpdated = 0;

    for (const [keyword, variants] of Object.entries(weightVariantsMap)) {
      const result = await Product.updateMany(
        { title: { $regex: keyword, $options: 'i' } },
        { weightVariants: variants },
        { multi: true }
      );
      
      totalUpdated += result.modifiedCount;
      console.log(`Updated ${result.modifiedCount} products matching "${keyword}"`);
    }

    res.status(200).json({
      success: true,
      message: `Added weight variants to ${totalUpdated} products`
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
