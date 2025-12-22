"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(c.reduce((s,i) => s + i.qty, 0));
    } catch(e) {}
    
    function onStorage(e){
      if(e.key === 'cart'){
        try{
          const c = JSON.parse(e.newValue || '[]');
          setCartCount(c.reduce((s,i) => s + i.qty, 0));
        }catch(err){}
      }
    }

    function onCartUpdated(){
      try{
        const c = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(c.reduce((s,i) => s + i.qty, 0));
      }catch(err){}
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('cartUpdated', onCartUpdated);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cartUpdated', onCartUpdated);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-green-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🚚 Free delivery on orders above ₹399</span>
          <span>📞 +91-93845-01766</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            {!logoError ? (
              <div className="h-14 w-14 relative">
                <Image
                  src="/images/logo.png"
                  alt="Priyam Supermarket"
                  fill
                  className="object-contain"
                  priority
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-600">Priyam <span className='text-gray-800'>Super Market</span></div>
            )}
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full">
              <input 
                type="text" 
                placeholder="Search for groceries, vegetables, fruits..." 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gray-200 border border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link 
              href="/signup" 
              className="hidden sm:block px-4 py-2 bg-white border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors text-sm font-medium"
            >
              Sign Up
            </Link>
            <Link 
              href="/cart" 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-sm font-semibold">{cartCount}</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              🔍
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}