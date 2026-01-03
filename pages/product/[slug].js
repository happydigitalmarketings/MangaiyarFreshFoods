import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductPage({ product }) {
  const router = useRouter();
  
  if (router.isFallback || !product) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [pageUrl, setPageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || null);
  const [selectedVariant, setSelectedVariant] = useState(
    product.weightVariants && product.weightVariants.length > 0 ? 0 : null
  );
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentMrp, setCurrentMrp] = useState(product.mrp);

  // Helper function to ensure weight has unit
  const getWeightWithUnit = (weight) => {
    if (!weight) return 'Select Weight';
    const weightStr = String(weight).trim();
    // Check if weight already has a unit (g, kg, ml, l, L)
    if (/\s*(g|kg|ml|l|L)\s*$/i.test(weightStr)) {
      return weightStr;
    }
    // If just a number, add 'g' as default
    return weightStr + ' g';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (selectedVariant !== null && product.weightVariants && product.weightVariants[selectedVariant]) {
      const variant = product.weightVariants[selectedVariant];
      setCurrentPrice(variant.price);
      setCurrentMrp(variant.mrp || variant.price);
    }
  }, [selectedVariant, product.weightVariants]);

  useEffect(() => {
    if (!product || !product._id) return;

    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        const filtered = d.filter(p => 
          p._id !== product._id && 
          (p.categories?.some(cat => product.categories?.includes(cat)) || true)
        ).slice(0, 4);
        setRelated(filtered);
      })
      .catch(err => console.error('Error fetching related products:', err));
  }, [product]);

  function addToCart(redirect = false) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const weightLabel = selectedVariant !== null && product.weightVariants 
      ? product.weightVariants[selectedVariant].weight 
      : product.weight;
    const cartItemId = selectedVariant !== null ? `${product._id}-${selectedVariant}` : product._id;
    
    const existing = cart.find(i => i._id === cartItemId);
    
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        _id: cartItemId,
        originalId: product._id,
        title: product.title,
        price: currentPrice,
        weight: weightLabel,
        image: product.images?.[0],
        qty,
        variant: selectedVariant
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    try {
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {}
    
    if (redirect) router.push('/cart');
  }

  function buyNow() {
    addToCart(false);
    router.push('/checkout');
  }

  function orderByWhatsApp() {
    const whatsappNumber = '919876543210';
    let productMessage = `Hi! I'm interested in ordering:\n\n${product.title}\nPrice: ₹${product.price}\nQuantity: ${qty}`;
    
    if (product.stock === 0) {
      productMessage += `\nStatus: Out of Stock`;
    }
    
    productMessage += `\n\nTotal: ₹${(product.price * qty).toLocaleString('en-IN')}\n\nProduct Link: ${pageUrl}`;
    
    const encodedMessage = encodeURIComponent(productMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  }

  const discountPercent = currentMrp && currentPrice < currentMrp 
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Head>
        <title>{product.title} - Priyam Supermarket</title>
        <meta name="description" content={product.description || 'Product page'} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description} />
      </Head>

    

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-600 transition">Home</Link>
          <span>/</span>
          {product.categories && product.categories[0] && (
            <>
              <Link href={`/products?category=${product.categories[0]}`} className="hover:text-green-600 transition">
                {product.categories[0]}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left: Product Images */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 aspect-square flex items-center justify-center">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center text-gray-400">No image available</div>
              )}
              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition ${
                      selectedImage === img ? 'border-green-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Information */}
          <div className="flex flex-col">
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

            {/* Rating & Stock Status */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
                <span className="text-sm text-gray-600 ml-2">(4.5)</span>
              </div>
              <div className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border border-gray-200">
              <div className="flex items-end gap-6 mb-4">
                {/* Original Price */}
                {currentMrp && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">M.R.P.</span>
                    <div className="text-lg text-gray-400 line-through">₹{currentMrp.toLocaleString('en-IN')}</div>
                  </div>
                )}
                
                {/* Offer Price */}
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Price</span>
                  <div className="text-3xl font-bold text-green-600">₹{currentPrice.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Savings */}
              {currentMrp && currentPrice < currentMrp && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">You save</p>
                  <p className="text-xl font-bold text-green-600">₹{(currentMrp - currentPrice).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            {/* Weight/Size Variants Selector */}
            {product.weightVariants && product.weightVariants.length > 0 ? (
              <div className="mb-6">
                {/* Collapse Header */}
                <button
                  onClick={() => setVariantsOpen(!variantsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-300 hover:border-green-600 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  <span className="font-semibold text-gray-900">{getWeightWithUnit(product.weightVariants[selectedVariant]?.weight)}</span>
                  <svg
                    className={`w-5 h-5 transition-transform text-gray-600 ${variantsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Expanded Variants List */}
                {variantsOpen && (
                  <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white overflow-hidden shadow-lg">
                    {product.weightVariants.map((variant, idx) => {
                      const discountForVariant = variant.mrp && variant.price < variant.mrp
                        ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
                        : 0;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedVariant(idx);
                            setVariantsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-green-50 transition-colors ${
                            selectedVariant === idx ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 text-left">
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900">{getWeightWithUnit(variant.weight)}</div>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                {discountForVariant > 0 && (
                                  <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                    {discountForVariant}% OFF
                                  </span>
                                )}
                                {variant.mrp && variant.price < variant.mrp && (
                                  <span className="text-gray-400 line-through">₹{variant.mrp}</span>
                                )}
                                <span className="font-bold text-green-600">₹{variant.price}</span>
                              </div>
                            </div>
                          </div>
                          {selectedVariant === idx && (
                            <svg className="w-5 h-5 text-green-600 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : product.weight ? (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight/Size:</label>
                <div className="text-lg font-bold text-gray-900">{product.weight}</div>
                <p className="text-xs text-gray-500 mt-2">Note: Add weightVariants to this product for size options</p>
              </div>
            ) : null}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity:</label>
              <div className="flex items-center gap-2 w-max">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition flex items-center justify-center font-bold text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 text-center border-2 border-gray-300 rounded-lg py-2 focus:outline-none focus:border-green-600 font-semibold"
                />
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition flex items-center justify-center font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-8">
              <button
                onClick={() => addToCart(true)}
                disabled={product.stock === 0}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>

              <button
                onClick={buyNow}
                disabled={product.stock === 0}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95"
              >
                Buy Now
              </button>

              <button
                onClick={orderByWhatsApp}
                className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 .01 5.37.01 12c0 2.12.55 4.15 1.6 5.93L0 24l6.37-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.18-3.48-8.52zM12 21.5c-1.7 0-3.36-.45-4.8-1.3l-.34-.2-3.78.98.99-3.68-.21-.36A9.5 9.5 0 1 1 21.5 12 9.47 9.47 0 0 1 12 21.5z" />
                </svg>
                Order via WhatsApp
              </button>
            </div>

            {/* Share Section */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Share this product:</p>
              <div className="flex gap-3">
                <a
                  href={pageUrl ? `https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-red-500 to-purple-600 flex items-center justify-center text-white hover:opacity-80 transition"
                  title="Share on Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" />
                  </svg>
                </a>

                <a
                  href={pageUrl ? `https://wa.me/?text=${encodeURIComponent(product.title + ' ' + pageUrl)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 .01 5.37.01 12c0 2.12.55 4.15 1.6 5.93L0 24l6.37-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.18-3.48-8.52z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-4xl mb-2">🚚</div>
            <h3 className="font-bold text-gray-900 mb-1">Free Delivery</h3>
            <p className="text-sm text-gray-600">On orders above ₹500</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">✓</div>
            <h3 className="font-bold text-gray-900 mb-1">Quality Assured</h3>
            <p className="text-sm text-gray-600">100% genuine products</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">↩</div>
            <h3 className="font-bold text-gray-900 mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600">Within 7 days</p>
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="mb-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(item => (
                <Link key={item._id} href={`/product/${item.slug}`} className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative bg-gray-100 aspect-square overflow-hidden">
                    <img
                      src={item.images?.[0] || '/images/placeholder.png'}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                    {item.mrp && item.price < item.mrp && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">{item.title}</h3>
                    {item.weight && (
                      <p className="text-xs text-gray-500 mb-2">{item.weight}</p>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      {item.mrp && (
                        <span className="text-xs text-gray-400 line-through">₹{item.mrp}</span>
                      )}
                      <span className="font-bold text-green-600">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticPaths() {
  const connectDB = (await import('../../lib/db')).default;
  const Product = (await import('../../models/Product')).default;
  
  try {
    await connectDB();
    const products = await Product.find({}, 'slug');
    const paths = products.map(product => ({
      params: { slug: product.slug }
    }));
    
    return {
      paths,
      fallback: true
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: true
    };
  }
}

export async function getStaticProps({ params }) {
  const connectDB = (await import('../../lib/db')).default;
  const Product = (await import('../../models/Product')).default;
  
  try {
    await connectDB();
    const product = await Product.findOne({ slug: params.slug });
    
    if (!product) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        product: JSON.parse(JSON.stringify(product))
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true
    };
  }
}
