import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function ProductPage({ product }) {
  const router = useRouter();
  if (router.isFallback) return <div>Loading...</div>;

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

  const originalPrice = product.mrp || product.originalPrice || product.oldPrice;

  return (
    <div>
      <Head>
        <title>{product.title} - Minikki</title>
      </Head>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded shadow-lg p-6">
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

              <div className="flex items-baseline gap-4 mb-4">
                {originalPrice && <div className="text-sm text-gray-400 line-through">₹{originalPrice}</div>}
                <div className="text-2xl font-semibold text-[#8B4513]">₹{product.price} <span className="text-sm text-gray-500">/ piece</span></div>
              </div>

              <p className="text-gray-700 mb-6 max-w-prose">{product.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-2">-</button>
                  <input type="number" value={qty} min="1" onChange={e => setQty(Math.max(1, Number(e.target.value)||1))} className="w-16 text-center border-l border-r" />
                  <button onClick={() => setQty(q => q+1)} className="px-3 py-2">+</button>
                </div>

                <button onClick={() => addToCart(true)} className="px-6 py-3 bg-[#8B4513] text-white rounded shadow">Add to Cart</button>
                <button onClick={buyNow} className="px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white rounded shadow">Buy Now</button>
              </div>

              <div className="text-sm text-gray-600 mb-1">
                <div className="mb-2">We Accept:</div>
                <div className="flex gap-2 items-center">
                  <img src="/images/payment/visa.svg" alt="visa" className="h-6" onError={(e)=>e.target.style.display='none'} />
                  <img src="/images/payment/mastercard.svg" alt="mastercard" className="h-6" onError={(e)=>e.target.style.display='none'} />
                  <img src="/images/payment/razorpay.svg" alt="razorpay" className="h-6" onError={(e)=>e.target.style.display='none'} />
                </div>
              </div>
            </div>

            <div className="mt-1 text-sm text-gray-700">
              <div>Share this product:</div>

              <div className="flex gap-3 mt-4 items-center">
                {/* Social share icons */}
                <a
                  href={pageUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(product.title)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.88h2.74l-.44 2.9h-2.3V22c4.78-.81 8.44-4.94 8.44-9.93z"/>
                  </svg>
                </a>

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
