import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400 text-sm">
              Your trusted destination for quality products. We offer the best selection of items at competitive prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>



          

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: info@mystore.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Store Street, City, Country</li>
            </ul>
          </div>




   <div>
              <h3 className="text-lg font-semibold mb-4">Payment</h3>
          <img src="/images/payment/visa.png" alt="Visa" className="h-8" />
          <img src="/images/payment/mastercard.png" alt="Mastercard" className="h-8" />
          <img src="/images/payment/razorpay.png" alt="Razorpay" className="h-8" />
          <img src="/images/payment/upi.png" alt="UPI" className="h-8" />
          <img src="/images/payment/netbanking.png" alt="Net Banking" className="h-8" />
        </div>







        </div>

        {/* Payment Methods */}
      <div className="border-t border-gray-800 mt-8 pt-8">
     
        <p className="text-center text-gray-400 text-sm">&copy; {new Date().getFullYear()} Minukki Sarees. All rights reserved.</p>
      </div>
      </div>
    </footer>
  );
}