import Head from 'next/head';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from 'next/link';
import { generateSchema, getBreadcrumbs } from '../lib/seo';

export default function About() {
  const breadcrumbs = getBreadcrumbs('/about');
  const breadcrumbSchema = generateSchema('BreadcrumbList', { items: breadcrumbs });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>About Mangaiyar Fresh Foods - Fresh Groceries Since 2010</title>
        <meta name="description" content="Learn about Mangaiyar Fresh Foods's journey of providing fresh groceries and daily essentials with love since 2010." />
        <meta name="keywords" content="about us, fresh groceries, supermarket, online shopping" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://priyamsupermarket.com/about" />
        <meta property="og:title" content="About Mangaiyar Fresh Foods" />
        <meta property="og:description" content="Learn about our journey and commitment to quality." />

        {/* Canonical */}
        <link rel="canonical" href="https://priyamsupermarket.com/about" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Head>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/" className="text-green-100 hover:text-white text-sm mb-4 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Mangaiyar Fresh Foods
            </h1>
            <p className="text-xl text-green-50">
              Your trusted neighborhood supermarket, serving fresh groceries and daily essentials with love since 2010.
            </p>
          </div>
        </div>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Story</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Mangaiyar Fresh Foods began as a small family-owned grocery store in 2010, founded with a simple mission: to provide our community with the freshest products at the best prices.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Over the years, we've grown from a single store to becoming one of the most trusted supermarkets in the region. Our commitment to quality, customer service, and community values has remained unchanged.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Today, we continue to serve thousands of families daily, ensuring that every customer leaves our store with a smile and the best products for their homes.
                </p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="w-40 h-40 rounded-full bg-green-600 flex items-center justify-center text-white mb-8">
                  <span className="text-8xl font-bold">P</span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">Mangaiyar Fresh Foods</h3>
                  <p className="text-gray-600 mt-2">Serving since 2010</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: '👥',
                  title: "Customer First",
                  description: "Every decision we make starts with our customers' needs in mind"
                },
                {
                  icon: '✓',
                  title: "Quality Products",
                  description: "We source only the freshest and highest quality products for you"
                },
                {
                  icon: '❤',
                  title: "Community Love",
                  description: "We give back to our community and support local suppliers"
                },
                {
                  icon: '🚚',
                  title: "Fast Delivery",
                  description: "Quick and reliable delivery right to your doorstep"
                }
              ].map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '14+', label: 'Years of Service' },
                { number: '50K+', label: 'Happy Customers' },
                { number: '5000+', label: 'Products' },
                { number: '100+', label: 'Team Members' }
              ].map((stat, index) => (
                <div key={index}>
                  <h3 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">{stat.number}</h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}