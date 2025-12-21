import Image from 'next/image';

export default function ProductCard({product}) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item._id === product._id);
      
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({
          _id: product._id,
          title: product.title,
          price: product.price,
          weight: product.weight,
          image: product.images?.[0],
          qty: 1
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

  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
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
        <h3 className="font-semibold text-sm text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2 mb-3">
          {product.title}
        </h3>

        {/* Unit/Weight */}
        <p className="text-xs text-gray-600 font-medium mb-3">
          {product.weight || 'Standard Pack'}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">₹{Math.round(product.price).toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">₹{Math.round(product.originalPrice).toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2 ${
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
  );
}

