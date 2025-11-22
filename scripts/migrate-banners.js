// scripts/migrate-banners.js
// This script updates existing banners to ensure they have CTA text
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const connectDB = require('../lib/db').default;
    const Banner = require('../models/Banner').default;
    
    await connectDB();
    console.log('Connected to DB');

    // Update all banners without CTA to have default or custom CTA text
    const result = await Banner.updateMany(
      { cta: { $exists: false } },
      { 
        $set: { 
          cta: 'Shop Now',
          updatedAt: new Date()
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} banners with CTA text`);

    // Also update any banners with empty CTA
    const result2 = await Banner.updateMany(
      { cta: '' },
      { 
        $set: { 
          cta: 'Shop Now',
          updatedAt: new Date()
        } 
      }
    );

    console.log(`Updated ${result2.modifiedCount} banners with empty CTA`);

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
