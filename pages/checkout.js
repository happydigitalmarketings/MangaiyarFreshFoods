
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

const initialForm = {
  firstName: '',
  company: '',
  country: 'India',
  address: '',
  address2: '',
  city: '',
  state: '',
  pin: '',
  phone: '',
  email: '',
  notes: '',
  paymentMethod: 'razorpay',
};

export default function Checkout() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function validate() {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = 'Full name is required.';
    if (!form.address) newErrors.address = 'Street address is required.';
    if (!form.city) newErrors.city = 'Town/City is required.';
    if (!form.pin) newErrors.pin = 'PIN Code is required.';
    if (!form.phone) newErrors.phone = 'Phone is required.';
    if (!form.email) newErrors.email = 'Email is required.';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (cart.length === 0) {
      setErrors({ submit: 'Cart is empty.' });
      return;
    }
    setSubmitting(true);
    // Save order and customer info to DB
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: form,
        items: cart.map(i => ({ 
          product: i.product?._id || i.product, 
          qty: i.qty, 
          price: i.price,
          productTitle: i.title,
          productImage: i.image
        })),
        total: subtotal,
        paymentMethod: form.paymentMethod,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!data.success) {
      setErrors({ submit: data.message || 'Order failed.' });
      return;
    }
    if (form.paymentMethod === 'razorpay') {
      // Start Razorpay payment
      const razor = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: subtotal }),
      }).then(r => r.json());
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razor.amount,
        currency: razor.currency,
        name: 'MyStore',
        description: 'Order Payment',
        order_id: razor.id,
        handler: async function (response) {
          // verify on server
          await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              orderDBId: data.orderId,
            }),
          });
          localStorage.removeItem('cart');
          setOrderPlaced(true);
          setOrderId(data.orderId);
        },
        prefill: { name: form.firstName, email: form.email },
      };
      if (typeof window !== 'undefined') {
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new window.Razorpay(options);
            rzp.open();
          };
          document.body.appendChild(script);
        } else {
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
        // Ensure cartUpdated event is dispatched after clearing cart
        localStorage.removeItem('cart');
        try { window.dispatchEvent(new Event('cartUpdated')); } catch(e) {}
      }
    } else {
      // Cash on Delivery
      localStorage.removeItem('cart');
      try { window.dispatchEvent(new Event('cartUpdated')); } catch(e) {}
      setOrderPlaced(true);
      setOrderId(data.orderId);
    }
  }

  if (orderPlaced) {
    const orderDetails = {
      firstName: form.firstName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      pin: form.pin,
      country: form.country,
      paymentMethod: form.paymentMethod,
      total: subtotal,
      items: cart,
    };

    return (
      <div className="bg-white min-h-screen">
        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="mb-4 flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your order is confirmed</h1>
            {form.paymentMethod === 'cod' && (
              <p className="text-gray-600 text-lg">COD Collection fee Rs. ₹{subtotal.toLocaleString('en-IN')} is applicable.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order & Shipping Details (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Details Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">📦</span>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded bg-gray-100"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.weight}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-600">Quantity: <span className="font-bold">{item.qty}</span></span>
                          <span className="font-bold text-gray-900">₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-green-600">₹{subtotal.toLocaleString('en-IN')} INR</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📧</span>
                  <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                </div>
                <p className="text-gray-700">{form.email || 'Not provided'}</p>
              </div>

              {/* Shipping Address */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🚚</span>
                  <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-gray-700 space-y-2 bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-900">{form.firstName}</p>
                  <p>{form.address} {form.address2 ? form.address2 + ',' : ''}</p>
                  <p>{form.city}, {form.state} {form.pin}</p>
                  <p>{form.country}</p>
                  <p className="font-semibold text-gray-900 pt-2">📞 {form.phone}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💳</span>
                  <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-900 font-semibold">
                    {form.paymentMethod === 'cod' 
                      ? '💰 Cash on Delivery (COD)' 
                      : '🛡️ Online Payment (Razorpay)'}
                  </p>
                  <p className="text-gray-700 text-sm mt-1">
                    Amount: ₹{subtotal.toLocaleString('en-IN')} INR
                  </p>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <h3 className="text-xl font-bold text-gray-900">Billing Address</h3>
                </div>
                <div className="text-gray-700 space-y-2 bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-900">{form.firstName}</p>
                  <p>{form.address} {form.address2 ? form.address2 + ',' : ''}</p>
                  <p>{form.city}, {form.state} {form.pin}</p>
                  <p>{form.country}</p>
                  <p className="font-semibold text-gray-900 pt-2">📞 {form.phone}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Order ID & Actions (1/3) */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 space-y-6">
                {/* Order ID Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Order Number</p>
                  <p className="text-3xl font-bold text-green-700 font-mono break-all">{orderId}</p>
                  <p className="text-xs text-gray-600 mt-3">Keep this for your records</p>
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-600 text-white">
                        ✓
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-600">Your order has been received</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-white">
                        📦
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">Processing</p>
                      <p className="text-sm text-gray-600">We are preparing your order</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-white">
                        🚚
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">On the Way</p>
                      <p className="text-sm text-gray-600">Your order is being delivered</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-white">
                        ✋
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">Order completed</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-lg transition-colors"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Need Help?</p>
                  <p className="text-xs text-blue-800 mb-3">Contact our customer support team</p>
                  <a href="https://wa.me/919876543210" className="inline-block w-full text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors">
                    WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
    
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 border-opacity-80"></div>
            <span className="mt-4 text-white text-lg font-semibold">Placing your order...</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        {errors.submit && <div className="bg-red-100 text-red-700 p-3 mb-6 rounded">{errors.submit}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Delivery Address & Payment (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📍</span>
                <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                  {errors.firstName && <div className="text-red-600 text-xs mt-1">{errors.firstName}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                  {errors.phone && <div className="text-red-600 text-xs mt-1">{errors.phone}</div>}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="Enter email for order updates"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="House no., Building, Street, Area"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
                {errors.address && <div className="text-red-600 text-xs mt-1">{errors.address}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                  {errors.city && <div className="text-red-600 text-xs mt-1">{errors.city}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Pincode <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                    value={form.pin}
                    onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
                  />
                  {errors.pin && <div className="text-red-600 text-xs mt-1">{errors.pin}</div>}
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">💳</span>
                <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${form.paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={() => setForm(f => ({ ...f, paymentMethod: 'cod' }))}
                    className="w-5 h-5 accent-green-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${form.paymentMethod === 'razorpay' ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={form.paymentMethod === 'razorpay'}
                    onChange={() => setForm(f => ({ ...f, paymentMethod: 'razorpay' }))}
                    className="w-5 h-5 accent-green-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Credit/Debit Card/NetBanking</p>
                    <p className="text-sm text-gray-600">Fast and secure payment</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📦</span>
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b last:border-b-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded bg-gray-100"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.weight}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-600">× {item.qty}</span>
                        <span className="font-bold text-gray-900">₹{Math.round(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">₹40</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">₹{Math.round(subtotal + 40).toLocaleString('en-IN')}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors mb-4"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-600 text-center">
                Add ₹454 more for free delivery
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
