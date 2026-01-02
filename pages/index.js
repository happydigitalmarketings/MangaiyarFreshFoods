import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import HeroBanner from '../components/HeroBanner';
import Features from '../components/Features';
import Categories from '../components/Categories';
import Deals from '../components/Deals';
import ProductCard from '../components/ProductCard';
import { generateSchema } from '../lib/seo';

export default function Home({products}){
  const organizationSchema = generateSchema('Organization');
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head>
        <title>Mangaiyar Fresh Foods - Fresh Groceries Delivered</title>
        <meta name="description" content="Shop fresh groceries, vegetables, fruits, dairy, and household essentials. Fast delivery, quality guaranteed." />
        <meta name="keywords" content="grocery delivery, fresh vegetables, fruits, dairy products, supermarket, online shopping" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Head>
      
      <main className="flex-grow">
        <HeroBanner />
        <Features />
        <Categories />
        <Deals />

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Popular Products</h2>
                <p className="text-gray-600 text-sm mt-2">12 products available</p>
              </div>             
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {products && products.length > 0 ? (
                products.slice(0, 12).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No products available yet</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const connectDB = (await import('../lib/db')).default;
    const Product = (await import('../models/Product')).default;

    await connectDB();
    const products = await Product.find({})
      .sort({ order: 1, createdAt: -1 })
      .limit(20)
      .lean();

    return {
      props: {
        products: JSON.parse(JSON.stringify(products))
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: []
      }
    };
  }
}

