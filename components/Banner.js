import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Banner() {
  // Use existing banner files: real JPG and SVG placeholders
  const images = [
    '/images/onam-banner.jpg',  // Real image
    '/images/banner-1.svg',     // Placeholder SVG
    '/images/banner-2.svg'      // Placeholder SVG
  ];

  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 4000; // 4s

  useEffect(() => {
    // autoplay
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, delay);
    return () => resetTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  function goTo(i) {
    setIndex(i % images.length);
  }

  function prev() {
    setIndex((idx) => (idx - 1 + images.length) % images.length);
  }

  function next() {
    setIndex((idx) => (idx + 1) % images.length);
  }

  return (
    <div className="relative bg-[#FFF8E7] overflow-hidden h-[70vh] min-h-[500px]">
      <div className="max-w-6xl mx-auto px-4 h-full">
        <div className="flex flex-col md:flex-row items-center justify-between h-full py-8 md:py-0">
          {/* Text Content - Left Side */}
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0 z-20">
            <h1 className="text-5xl md:text-6xl font-serif text-[#8B4513] mb-4">
              Traditional Kerala
              <br />
              <span className="text-[#654321]">Elegance</span>
            </h1>
            <p className="text-lg md:text-xl text-[#8B4513] mb-8 max-w-md">
              Discover our handpicked collection of authentic Kerala sarees,
              where tradition meets contemporary elegance.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-[#8B4513] text-white rounded-full hover:bg-[#703810] transition-colors font-medium"
            >
              Explore Collection
            </Link>
          </div>

          {/* Slider - Right Side */}
          <div className="md:w-1/2 relative w-full h-64 md:h-full overflow-hidden rounded-md">
            <div
              className="whitespace-nowrap transition-transform duration-700 h-full"
              style={{ transform: `translateX(-${index * 100}%)`, width: `${images.length * 100}%` }}
            >
              {images.map((src, i) => (
                <div key={src + i} className="inline-block w-full h-full align-middle">
                  <div className="relative w-full h-full bg-gray-100">
                    <img
                      src={src}
                      alt={`Banner ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <button
              aria-label="Previous"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-[#8B4513] rounded-full p-2 shadow hover:bg-white z-30"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-[#8B4513] rounded-full p-2 shadow hover:bg-white z-30"
            >
              ›
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-3 h-3 rounded-full ${i === index ? 'bg-[#8B4513]' : 'bg-white/80'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-repeat-x" style={{ backgroundImage: 'url("/images/border-pattern.png")' }} />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-repeat-x" style={{ backgroundImage: 'url("/images/border-pattern.png")' }} />
      </div>
    </div>
  );
}