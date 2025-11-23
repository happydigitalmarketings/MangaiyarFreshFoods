import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function ProductPage({ product }) {
    const [related, setRelated] = useState([]);

    useEffect(() => {
      // Fetch other products for 'You might also like' section
     if (!product?._id) return;
      fetch('/api/products')
        .then(r => r.json())
        .then(d => {
          // Exclude current product
          setRelated(d.filter(p => p._id !== product._id).slice(0, 8));
        });
    }, [product._id]);
  const router = useRouter();
  if (router.isFallback) return <div>Loading...</div>;

  if (!product) {
  return <div>Loading...</div>;
}

  const imgs = product.images || [];
  const [selected, setSelected] = useState(imgs[0] || null);
  const [qty, setQty] = useState(1);
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, []);

  function addToCart(redirect = true){
    const cart = JSON.parse(localStorage.getItem('cart')||'[]');
    const existing = cart.find(i=>i.product._id===product._id);
    if(existing){ existing.qty += qty; } else { cart.push({ product, qty, price: product.price }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    // notify other components in same tab
    try{ window.dispatchEvent(new Event('cartUpdated')); }catch(e){}
    if(redirect) router.push('/cart');
  }

  function buyNow(){
    addToCart(false);
    router.push('/cart');
  }

  function orderByWhatsApp(){
    const whatsappNumber = '917094824932';
    const productMessage = `Hi! I'm interested in ordering:\n\n${product.title}\nPrice: ₹${product.price}\nQuantity: ${qty}\n\nTotal: ₹${(product.price * qty).toLocaleString('en-IN')}\n\nProduct Link: ${pageUrl}`;
    const encodedMessage = encodeURIComponent(productMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  }

  const originalPrice = product.mrp || product.originalPrice || product.oldPrice;

  return (
    <div>
      <Head>
        <title>{product.title} - Minikki</title>
      </Head>

      <main className="container-fluid mx-auto p-6 bg-[#FDF8F1] rounded shadow-lg" >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white  p-6">
          {/* Left - Images */}
          <div>
            <div className="w-full bg-gray-50 rounded overflow-hidden mb-4" style={{minHeight: 420}}>
              {selected ? (
                <img src={selected} alt={product.title} className="w-full h-[420px] object-contain" />
              ) : (
                <div className="w-full h-[420px] flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-3">
              {imgs.length > 0 ? imgs.map((src, i) => (
                <button key={i} onClick={() => setSelected(src)} className={`w-20 h-20 rounded overflow-hidden border ${selected===src? 'border-[#8B4513]': 'border-gray-200'}`}>
                  <img src={src} alt={`${product.title} ${i+1}`} className="w-full h-full object-cover" />
                </button>
              )) : (
                <div className="text-gray-400">No photos</div>
              )}
            </div>
                  </div>

                  {/* Right - Details */}
                  <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-serif text-[#10223b] mb-2">{product.title}</h1>
              {product.sku && <div className="text-sm text-gray-500 mb-4">SKU: {product.sku}</div>}

              {/* Rating Section (Placeholder for future) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">(0 reviews)</span>
              </div>

              {/* Pricing Section */}
              <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                <div className="flex items-end gap-8 mb-4">
                  {/* MRP */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1">M.R.P.</span>
                    {product.mrp ? (
                      <span className="text-xl text-gray-400 line-through font-semibold">₹{product.mrp.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not available</span>
                    )}
                  </div>
                  
                  {/* Offer Price */}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 uppercase tracking-widest font-bold mb-1">Offer Price</span>
                    <span className="text-4xl font-black text-[#8B4513]">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Badges Row */}
                {product.mrp && product.price < product.mrp && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </span>
                    <span className="inline-block bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                      Limited time deal
                    </span>
                  </div>
                )}

                {/* Savings Info */}
                {product.mrp && product.price < product.mrp && (
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t-2 border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold mb-1">You Save</p>
                      <p className="text-2xl font-bold text-green-600">₹{(product.mrp - product.price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Quantity and Action Buttons */}
              <div className="space-y-4 mb-6">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-4 py-2 hover:bg-gray-100 transition">−</button>
                    <input type="number" value={qty} min="1" onChange={e => setQty(Math.max(1, Number(e.target.value)||1))} className="w-16 text-center border-l border-r border-gray-300 focus:outline-none font-semibold" />
                    <button onClick={() => setQty(q => q+1)} className="px-4 py-2 hover:bg-gray-100 transition">+</button>
                  </div>
                </div>

                {/* Primary Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button onClick={() => addToCart(true)} className="w-full px-6 py-4 bg-[#8B4513] hover:bg-[#703810] text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                  
                  <button onClick={buyNow} className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-105">
                    Buy Now
                  </button>
                </div>

                {/* WhatsApp Button */}
                <button onClick={orderByWhatsApp} className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 .01 5.37.01 12c0 2.12.55 4.15 1.6 5.93L0 24l6.37-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.18-3.48-8.52zM12 21.5c-1.7 0-3.36-.45-4.8-1.3l-.34-.2-3.78.98.99-3.68-.21-.36A9.5 9.5 0 1 1 21.5 12 9.47 9.47 0 0 1 12 21.5z" />
                    <path fill="#fff" d="M17.06 14.29c-.29-.15-1.71-.84-1.98-.94-.27-.1-.47-.15-.67.15-.2.29-.77.94-.95 1.13-.17.2-.35.22-.64.07-.29-.15-1.22-.45-2.32-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.3-.49.1-.2.04-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.02-.37-.02-.57-.02s-.52.08-.79.37c-.27.29-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.5 1.69.64.71.24 1.36.21 1.87.13.57-.09 1.71-.7 1.95-1.38.24-.67.24-1.25.17-1.38-.07-.13-.27-.2-.57-.35z" />
                  </svg>
                  Order via WhatsApp
                </button>
              </div>         
            </div>

            <div className="mt-1 text-sm text-gray-700">
              <div>Share this product:</div>

              <div className="flex gap-3 mt-4 items-center">
                {/* Social share icons */}
                 <a
                  href={pageUrl ? `https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}` : 'https://www.instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Instagram"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <linearGradient id="igGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#f58529" />
                      <stop offset="50%" stopColor="#dd2a7b" />
                      <stop offset="100%" stopColor="#8134af" />
                    </linearGradient>
                    <path fill="url(#igGrad)" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.2A4.8 4.8 0 1 0 16.8 13 4.8 4.8 0 0 0 12 8.2zm6.4-2.6a1.12 1.12 0 1 0 1.12 1.12A1.12 1.12 0 0 0 18.4 5.6z" />
                  </svg>
                </a>

                <a
                  href={pageUrl ? `https://wa.me/?text=${encodeURIComponent(product.title + ' ' + pageUrl)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on WhatsApp"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#25D366" d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 .01 5.37.01 12c0 2.12.55 4.15 1.6 5.93L0 24l6.37-1.65A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.18-3.48-8.52zM12 21.5c-1.7 0-3.36-.45-4.8-1.3l-.34-.2-3.78.98.99-3.68-.21-.36A9.5 9.5 0 1 1 21.5 12 9.47 9.47 0 0 1 12 21.5z"/>
                    <path fill="#fff" d="M17.06 14.29c-.29-.15-1.71-.84-1.98-.94-.27-.1-.47-.15-.67.15-.2.29-.77.94-.95 1.13-.17.2-.35.22-.64.07-.29-.15-1.22-.45-2.32-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.3-.49.1-.2.04-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.02-.37-.02-.57-.02s-.52.08-.79.37c-.27.29-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.49.71.31 1.26.5 1.69.64.71.24 1.36.21 1.87.13.57-.09 1.71-.7 1.95-1.38.24-.67.24-1.25.17-1.38-.07-.13-.27-.2-.57-.35z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

   {/* You might also like section */}
                <div className="mt-10 bg-white " >
                  <h2 className="text-xl font-bold mb-4 text-gray-900">You might also like</h2>
                  <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                    {related.map(item => (
                      <div key={item._id} className="min-w-[180px] max-w-[200px] bg-white rounded-lg shadow p-3 flex flex-col items-center">
                        <img src={item.images?.[0] || '/images/placeholder.png'} alt={item.title} className="w-32 h-32 object-cover rounded mb-2" />
                        <div className="text-sm font-semibold text-gray-900 text-center line-clamp-2 mb-1">{item.title}</div>
                        <div className="flex flex-col items-center mb-1">
                          {item.mrp && (
                            <span className="text-xs text-gray-400 line-through">M.R.P. ₹{item.mrp.toLocaleString('en-IN')}</span>
                          )}
                          <span className="text-base font-bold text-[#8B4513]">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                        {item.mrp && item.price < item.mrp && (
                          <span className="text-xs font-bold text-red-600">-{Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF</span>
                        )}
                        <button onClick={() => window.location.href = `/product/${item.slug}`} className="mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded shadow transition-colors">View</button>
                      </div>
                    ))}
                  </div>
                </div>


      </main>
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
