import { useEffect, useState } from 'react';
import CartItem from '../components/CartItem';
import { useRouter } from 'next/router';
export default function CartPage(){
  const [cart, setCart] = useState([]);
  const router = useRouter();
  useEffect(()=>{ setCart(JSON.parse(localStorage.getItem('cart')||'[]')); },[]);
  function changeQty(idx, qty){ const c=[...cart]; c[idx].qty = qty; setCart(c); localStorage.setItem('cart', JSON.stringify(c)); try{ window.dispatchEvent(new Event('cartUpdated')) }catch(e){} }
  function removeIdx(idx){ const c=[...cart]; c.splice(idx,1); setCart(c); localStorage.setItem('cart', JSON.stringify(c)); try{ window.dispatchEvent(new Event('cartUpdated')) }catch(e){} }
  function checkout(){ router.push('/checkout'); }
  const total = cart.reduce((s,i)=>s + i.qty * i.price, 0);
  const subtotal = total;
  const shipping = 0;
  const tax = 0;
  const discount = 0;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <main className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Product Table */}
          <div className="lg:col-span-2">
            {cart.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 bg-yellow-400 p-4 font-semibold text-white">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Subtotal</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {cart.map((item, idx) => {
                    const imgs = item.product.images || [];
                    const itemSubtotal = item.price * item.qty;
                    return (
                      <div key={item.product._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50">
                        {/* Remove Button */}
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => removeIdx(idx)}
                            title="Remove"
                            className="text-gray-400 hover:text-red-600 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Product Column */}
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {imgs[0] ? (
                              <img src={imgs[0]} alt={item.product.title} className="w-full h-full object-cover rounded" />
                            ) : (
                              <div className="text-gray-300 text-xs">No Image</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.product.title}</div>
                            {item.product.subtitle && <div className="text-xs text-gray-500">{item.product.subtitle}</div>}
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="col-span-2 text-center">
                          <div className="font-semibold text-gray-900">₹{item.price}</div>
                        </div>

                        {/* Quantity Column */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <button
                              onClick={() => changeQty(idx, Math.max(1, item.qty - 1))}
                              className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-medium"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={e => changeQty(idx, Math.max(1, Number(e.target.value) || 1))}
                              className="w-12 text-center border-l border-r border-gray-300 outline-none px-1 py-1"
                              aria-label="Quantity"
                            />
                            <button
                              onClick={() => changeQty(idx, item.qty + 1)}
                              className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-medium"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal Column */}
                        <div className="col-span-2 text-center">
                          <div className="font-bold text-gray-900">₹{itemSubtotal}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          {cart.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Items</span>
                    <span className="font-semibold">{cart.reduce((s, i) => s + i.qty, 0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Sub Total</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">₹{shipping}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">-₹{discount}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{total}</span>
                </div>

                <button 
                  onClick={checkout}
                  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
