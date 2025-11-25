import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({product}) {
  return (
    <Link href={`/product/${product.slug}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-[450px] overflow-hidden bg-gray-50">
          {product.images && product.images.length ? (
            <Image
              src={product.images[0] || "/images/products/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              onError={(e) => {
                e.currentTarget.src = "/images/products/placeholder.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Image Coming Soon</p>
            </div>
          )}
          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {product.discount}% OFF
            </div>
          )}
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              Quick View
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-[#8B4513] transition-colors line-clamp-2">
            {product.title}
          </h3>

          {/* Attributes */}
          <div className="space-y-1 mb-3">
            <p className="text-sm text-gray-600">
              {product.attributes?.material} • {product.attributes?.color}
            </p>
            {product.attributes?.pattern && (
              <p className="text-sm text-gray-500">Pattern: {product.attributes.pattern}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
              {product.stock === 0 && (
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              )}
          </div>
        </div>
      </div>
    </Link>
  );
}
