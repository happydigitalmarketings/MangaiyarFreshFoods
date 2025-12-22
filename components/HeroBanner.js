import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch banners from API
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };
  return (
    <section className="bg-gradient-to-r from-green-50 to-yellow-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div>
              <p className="text-green-600 font-semibold text-sm mb-2">✓ Fresh Always Deals</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Fresh Groceries,
                <span className="text-green-600"> Delivered</span> to
                <span className="text-green-600"> Your Door</span>
              </h1>
            </div>
            
            <p className="text-gray-600 text-lg">
              Shop from thousands of fresh products at Priyam Supermarket. Quality guaranteed, always fresh, always affordable.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link 
                href="/products"
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Shop Now →
              </Link>
              <Link 
                href="/offers"
                className="px-8 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                View Offers
              </Link>
            </div>
          </div>

          {/* Right Image - Slider */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-100 to-yellow-100 rounded-3xl p-8 relative overflow-hidden shadow-lg">
              {/* Discount Badge */}
              <div className="absolute top-6 right-6 bg-yellow-400 rounded-full w-24 h-24 flex items-center justify-center text-center z-20 shadow-lg">
                <div>
                  <p className="text-lg font-bold text-gray-800">50%</p>
                  <p className="text-xs font-bold text-gray-800">OFF</p>
                </div>
              </div>

              {/* Image Slider Container */}
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-200">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading banners...</p>
                    </div>
                  </div>
                ) : banners.length > 0 ? (
                  <>
                    {banners.map((banner, index) => (
                      <div
                        key={banner._id || index}
                        className={`absolute w-full h-full transition-opacity duration-1000 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <Image
                          src={banner.image}
                          alt={banner.title || `Banner ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    ))}

                    {/* Previous Button */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      aria-label="Previous slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      aria-label="Next slide"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">No banners available</p>
                  </div>
                )}
              </div>

              {/* Slide Indicators */}
              {banners.length > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-green-600 w-8'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
