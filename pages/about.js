import Head from 'next/head';
import Footer from '../components/Footer';
import Image from 'next/image';
import { generateSchema, getBreadcrumbs } from '../lib/seo';

export default function About() {
  const breadcrumbs = getBreadcrumbs('/about');
  const breadcrumbSchema = generateSchema('BreadcrumbList', { items: breadcrumbs });
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F1]">
      <Head>
        <title>About Us - Our Heritage & Mission | Minukki Sarees</title>
        <meta name="description" content="Learn about our heritage, values, and commitment to preserving traditional Kerala saree craftsmanship. Discover our journey and mission." />
        <meta name="keywords" content="about sarees, Kerala heritage, handloom tradition, saree craftsmanship" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minukki.in/about" />
        <meta property="og:title" content="About Us - Our Heritage & Mission | Minukki Sarees" />
        <meta property="og:description" content="Learn about our heritage, values, and commitment to preserving traditional Kerala saree craftsmanship." />

        {/* Canonical */}
        <link rel="canonical" href="https://minukki.in/about" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Head>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-[#8B4513]/5 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-[#8B4513] mb-6">
                Our Story
              </h1>
              <p className="text-lg text-[#5C4033] max-w-2xl mx-auto">
                Preserving the rich heritage of Kerala's handloom tradition while 
                bringing elegant sarees to modern fashion enthusiasts.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="/images/banner-2.jpg"
                  alt="Traditional Kerala Handloom Weaver"
                  fill
                  className=""
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div>
                <h2 className="text-3xl font-serif text-[#8B4513] mb-6">Our Mission</h2>
                <p className="text-gray-700 mb-6">
                  Our journey began with a simple yet profound mission: to preserve and promote 
                  the exquisite art of Kerala handloom weaving while making these timeless pieces 
                  accessible to saree enthusiasts worldwide.
                </p>
                <p className="text-gray-700 mb-6">
                  We work directly with skilled artisans and weavers, ensuring fair trade practices 
                  and helping sustain this centuries-old craft. Each saree in our collection tells 
                  a story of tradition, craftsmanship, and cultural heritage.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-medium text-[#8B4513] mb-2">15+ Years</h3>
                    <p className="text-gray-600">Of Excellence</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[#8B4513] mb-2">100+</h3>
                    <p className="text-gray-600">Artisan Partners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-center text-[#8B4513] mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Quality & Authenticity",
                  description: "Every saree is carefully curated to ensure the highest quality and authenticity"
                },
                {
                  title: "Fair Trade",
                  description: "Supporting local artisans with fair wages and sustainable practices"
                },
                {
                  title: "Heritage",
                  description: "Preserving and promoting traditional Kerala handloom techniques"
                }
              ].map((value, index) => (
                <div key={index} className="text-center p-6 rounded-lg border border-[#8B4513]/20">
                  <h3 className="text-xl font-medium text-[#8B4513] mb-4">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif text-[#8B4513] mb-6">Get in Touch</h2>
            <p className="text-gray-700 mb-8">
              Have questions about our products or want to learn more about our story?
              We'd love to hear from you.
            </p>
            <a 
              href="mailto:contact@keralasarees.com"
              className="inline-block px-8 py-3 bg-[#8B4513] text-white rounded hover:bg-[#654321] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}