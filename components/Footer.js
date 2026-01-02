import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center font-bold text-xl">
                M
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">Mangaiyar</h3>
                <p className="text-xs opacity-70">Fresh Foods</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Fresh groceries delivered to your door. Quality guaranteed, always fresh, always affordable.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition">f</a>
              <a href="#" className="text-gray-400 hover:text-white transition">📷</a>
              <a href="#" className="text-gray-400 hover:text-white transition">𝕏</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white text-sm">All Products</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-white text-sm">Today's Deals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm">Return Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link></li>             
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📞 +91-93845-01766</li>
              <li>✉️ support@priyam.com</li>
              <li>📍 123 Market Street, City Center, New Delhi -110001</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Mangaiyar Fresh Foods. All rights reserved.
            </p>
            <div className="flex gap-2">
              <span className="text-gray-400 text-xs bg-gray-800 px-3 py-1 rounded">Safe & Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
