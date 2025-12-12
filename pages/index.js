import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import Image from 'next/image';
import { generateSchema } from '../lib/seo';

export default function Home({products}){
  const organizationSchema = generateSchema('Organization');
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F1]">
      <Head>
        <title>Kerala Sarees - Traditional Elegance | Minukki Sarees</title>
        <meta name="description" content="Discover our exquisite collection of traditional Kerala sarees, handcrafted with love and heritage. Kasavu, Tissue, Silk & Designer sarees." />
        <meta name="keywords" content="Kerala sarees, Kasavu sarees, Tissue sarees, Silk sarees, Traditional sarees, Handloom sarees" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minukki.in/" />
        <meta property="og:title" content="Kerala Sarees - Traditional Elegance | Minukki Sarees" />
        <meta property="og:description" content="Discover our exquisite collection of traditional Kerala sarees, handcrafted with love and heritage." />
        <meta property="og:image" content="https://minukki.in/images/logo.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://minukki.in/" />
        <meta property="twitter:title" content="Kerala Sarees - Traditional Elegance | Minukki Sarees" />
        <meta property="twitter:description" content="Discover our exquisite collection of traditional Kerala sarees, handcrafted with love and heritage." />
        <meta property="twitter:image" content="https://minukki.in/images/logo.jpg" />

        {/* Canonical */}
        <link rel="canonical" href="https://minukki.in/" />
        <link rel="icon" href="/images/logo-symbol.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Head>
      
      <main className="flex-grow">
        {/* Banner Slider with Integrated Hero Section */}
        <Banner />

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-center text-[#8B4513] mb-12">
              BROWSE BY CATEGORY
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'KASAVU SAREES', image: '/images/categories/kasavu.jpg' },
                { name: 'SET SAREES', image: '/images/categories/set.jpg' },
                { name: 'TISSUE SAREES', image: '/images/categories/tissue.jpg' },
                { name: 'HANDLOOM SAREES', image: '/images/categories/handloom.jpg' },
                { name: 'DESIGNER SAREES', image: '/images/categories/designer.jpg' },
                { name: 'SILK KASAVU SAREES', image: '/images/categories/silk-kasavu.jpg' },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name.toLowerCase().replace(' ', '-')}`}
                  className="group relative h-64 overflow-hidden border border-[#8B4513]/20 rounded-lg"
                >
                  <div className="absolute inset-0 bg-[#8B4513]/10 group-hover:bg-[#8B4513]/20 transition-colors z-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-xl font-medium text-[#8B4513] bg-white/90 px-6 py-3 rounded">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-center text-[#8B4513] mb-12">
              NEW ARRIVALS
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products?.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/products" 
                className="inline-block px-8 py-3 border-2 border-[#8B4513] text-[#8B4513] rounded hover:bg-[#8B4513] hover:text-white transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export async function getStaticProps() {
  try {
    // Import using ES modules
    const connectDB = (await import('../lib/db')).default;
    const Product = (await import('../models/Product')).default;

    await connectDB();
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return {
      props: {
        products: JSON.parse(JSON.stringify(products))
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: []
      },
      revalidate: 60
    };
  }
}
