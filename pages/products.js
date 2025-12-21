import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { generateSchema, getBreadcrumbs } from '../lib/seo';

export default function Products({ products }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from public API
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        setCategories(['All', ...data.map(c => c.name)]);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setLoading(false);
      });
  }, []);

  // if a category slug is provided as query param (e.g. /products?category=kasavu-sarees)
  // pre-select the matching category name
  useEffect(() => {
    if (!router.isReady) return;
    const { category } = router.query;
    if (category) {
      const foundCategory = categories.find(c => 
        c !== 'All' && c.toLowerCase().replace(/\s+/g, '-') === category
      );
      if (foundCategory) {
        setSelectedCategory(foundCategory);
      }
    }
  }, [router.isReady, router.query, categories]);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.categories && p.categories.includes(selectedCategory));

  const breadcrumbs = getBreadcrumbs('/products');
  const breadcrumbSchema = generateSchema('BreadcrumbList', { items: breadcrumbs });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container-fluid mx-auto px-4 py-8 bg-[#FDF8F1] flex items-center justify-center">
          <div className="text-center">Loading categories...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Our Collections | Traditional Sarees - Minukki Sarees</title>
        <meta name="description" content="Explore our beautiful collection of traditional and modern sarees. Browse by category: Kasavu, Tissue, Silk, Designer, Handloom sarees and more." />
        <meta name="keywords" content="saree collections, traditional sarees, modern sarees, Kasavu, Tissue sarees, Designer sarees" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minukki.in/products" />
        <meta property="og:title" content="Our Collections | Traditional Sarees - Minukki Sarees" />
        <meta property="og:description" content="Explore our beautiful collection of traditional and modern sarees." />

        {/* Canonical */}
        <link rel="canonical" href="https://minukki.in/products" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Head>

      <main className="flex-grow container-fluid  px-4 py-8 bg-[#FDF8F1]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Collections</h1>
          <p className="text-gray-600">Discover our exquisite range of handpicked sarees</p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full border ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white'
                } transition-colors`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* No Products Found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No products found in this category</h3>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const connectDB = (await import('../lib/db')).default;
    const Product = (await import('../models/Product')).default;

    await connectDB();
    const products = await Product.find({}).sort({ order: 1, createdAt: -1 }).lean();

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