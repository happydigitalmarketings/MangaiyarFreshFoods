"use client";
import Image from "next/image";  
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(c.reduce((s,i) => s + i.qty, 0));
    } catch(e) {}
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-32 h-12">
              <Image 
                src="/images/logo.jpg" 
                alt="Minukki Sarees Logo" 
                width={128}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-[#8B4513] transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-[#8B4513] transition-colors">
              Products
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-[#8B4513] transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#8B4513] transition-colors">
              Contact
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-[#8B4513] transition-colors">
              Blog
            </Link>
            <Link 
              href="/admin" 
              className="text-gray-600 hover:text-[#8B4513] transition-colors border-l pl-6"
            >
              Admin
            </Link>
            <Link 
              href="/cart" 
              className="flex items-center gap-2 px-4 py-2 bg-[#8B4513] text-white rounded-full hover:bg-[#703810] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Cart ({cartCount})</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t mt-4 space-y-4">
            <Link href="/" className="block text-gray-600 hover:text-[#8B4513] transition-colors">
              Home
            </Link>
            <Link href="/products" className="block text-gray-600 hover:text-[#8B4513] transition-colors">
              Products
            </Link>
            <Link href="/about" className="block text-gray-600 hover:text-[#8B4513] transition-colors">
              About
            </Link>
            <Link href="/contact" className="block text-gray-600 hover:text-[#8B4513] transition-colors">
              Contact
            </Link>
            <Link href="/blog" className="block text-gray-600 hover:text-[#8B4513] transition-colors">
              Blog
            </Link>
            <Link href="/admin" className="block text-gray-600 hover:text-[#8B4513] transition-colors">
              Admin
            </Link>
            <Link 
              href="/cart" 
              className="flex items-center gap-2 px-4 py-2 bg-[#8B4513] text-white rounded-full hover:bg-[#703810] transition-colors w-full justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span>Cart ({cartCount})</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}