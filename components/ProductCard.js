import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function ProductCard({product}) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [variantsOpen, setVariantsOpen] = useState(false);
  
  const hasVariants = product.weightVariants && product.weightVariants.length > 0;
  const currentVariant = hasVariants ? product.weightVariants[selectedVariant] : null;
  const displayPrice = currentVariant ? currentVariant.price : product.price;
  const displayWeight = currentVariant ? currentVariant.weight : (product.weight || 'Standard Pack');
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItemId = hasVariants ? `${product._id}-${selectedVariant}` : product._id;
      const existingItem = cart.find(item => item._id === cartItemId);
      
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({
          _id: cartItemId,
          originalId: product._id,
          title: product.title,
          price: displayPrice,
          weight: displayWeight,
          image: product.images?.[0],
          qty: 1,
          variant: hasVariants ? selectedVariant : null
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      // Open the cart sidebar
      window.dispatchEvent(new Event('openCart'));
    } catch(err) {
      console.error('Error adding to cart:', err);
    }
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    if (product.slug) {
      router.push(`/product/${product.slug}`);
    }
  };

  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;

  return (
    <div className="block">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
          onClick={(e) => {
            // Prevent navigation if clicking on select
            if (e.target.tagName === 'SELECT') {
              e.preventDefault();
            }
          }}
        >
          {/* Image Container */}
          <div className="relative h-56 overflow-hidden bg-gray-100 cursor-pointer" onClick={handleImageClick}>
            {product.images && product.images.length ? (
              <Image
                src={product.images[0] || "/images/products/placeholder.jpg"}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority
                onError={(e) => {
                  e.currentTarget.src = "/images/products/placeholder.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 p-4">
                <div className="text-3xl mb-2">🛒</div>
                <p className="text-gray-600 text-xs text-center">No image</p>
              </div>
            )}
            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-3 left-3 bg-orange-400 text-white px-2.5 py-1 rounded-md text-xs font-bold">
                {product.discount}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-3 py-3 flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400 text-sm">⭐</span>
              <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-600">({reviews})</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-md text-gray-600 group-hover:text-green-600 transition-colors line-clamp-2 mb-2" style={{fontFamily: 'Poppins', fontWeight: 600}}>
              {product.title}
            </h3>

            {/* Unit/Weight */}
            {hasVariants ? (
              <div className="mb-3 relative z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setVariantsOpen(!variantsOpen);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 border-2 border-green-600 bg-white text-gray-900 font-semibold rounded-lg hover:border-green-700 transition-colors"
                >
                  <span className="text-sm">{product.weightVariants[selectedVariant]?.weight || 'Select Weight'}</span>
                  <svg
                    className={`w-4 h-4 transition-transform text-gray-600 ${variantsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown Variants List */}
                {variantsOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 border-2 border-gray-300 rounded-lg bg-white shadow-xl z-50 max-h-96 overflow-y-auto">
                    {product.weightVariants.map((variant, idx) => {
                      const discountForVariant = variant.mrp && variant.price < variant.mrp
                        ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
                        : 0;
                      
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedVariant(idx);
                            setVariantsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-3 border-b border-gray-200 hover:bg-green-50 transition-colors text-left last:border-b-0 ${
                            selectedVariant === idx ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900">{variant.weight}</div>
                            <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                              {discountForVariant > 0 && (
                                <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                  {discountForVariant}% OFF
                                </span>
                              )}
                              {variant.mrp && variant.price < variant.mrp && (
                                <span className="text-gray-400 line-through whitespace-nowrap">₹{variant.mrp}</span>
                              )}
                              <span className="font-bold text-green-600 whitespace-nowrap">₹{variant.price}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">⏱ 10 MINS</div>
                          </div>
                          {selectedVariant === idx && (
                            <svg className="w-4 h-4 text-green-600 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 font-medium mb-3">
                {product.weight || 'Standard Pack'}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-gray-900" >₹{Math.round(displayPrice).toLocaleString('en-IN')}</span>
              {hasVariants && currentVariant?.mrp && currentVariant.mrp > currentVariant.price && (
                <span className="text-md text-gray-500 line-through">₹{Math.round(currentVariant.mrp).toLocaleString('en-IN')}</span>
              )}
              {!hasVariants && product.originalPrice && (
                <span className="text-md text-gray-500 line-through">₹{Math.round(product.originalPrice).toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-2 rounded-md font-semibold text-xd transition-colors flex items-center justify-center gap-2 ${
                product.stock === 0 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <span>🛒</span>
              {product.stock === 0 ? 'Out of Stock' : 'Add'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

