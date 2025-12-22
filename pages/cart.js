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
    <div className="min-h-screen py-8 bg-[#FDF8F1]">
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
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-4 bg-green-600 p-4 font-semibold text-white">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Subtotal</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {cart.map((item, idx) => {
                    const itemSubtotal = item.price * item.qty;
                    return (
                      <div key={item._id} className="p-4">
                        {/* Desktop View: Grid */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                          {/* Remove Button */}
                          <div className="col-span-1 flex justify-center">
                            <button
                              onClick={() => removeIdx(idx)}
                              title="Remove"
                              className="text-red-500 hover:text-red-700 transition"
                            >
                           <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>

                          {/* Product Column */}
                          <div className="col-span-5 flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />
                              ) : (
                                <div className="text-gray-300 text-xs">No Image</div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              {item.weight && <div className="text-xs text-gray-500">{item.weight}</div>}
                            </div>
                          </div>

                          {/* Price Column */}
                          <div className="col-span-2 text-center">
                            <div className="font-semibold text-gray-900">₹{item.price.toLocaleString('en-IN')}</div>
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
                            <div className="font-bold text-gray-900">₹{itemSubtotal.toLocaleString('en-IN')}</div>
                          </div>
                        </div>

                        {/* Mobile View: Card Layout */}
                        <div className="md:hidden space-y-3">
                          <div className="flex gap-3">
                            {/* Product Image & Info */}
                            <div className="flex-1">
                              <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mb-2">
                                {item.image ? (
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />
                                ) : (
                                  <div className="text-gray-300 text-xs">No Image</div>
                                )}
                              </div>
                              <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                              {item.weight && <div className="text-xs text-gray-500">{item.weight}</div>}
                            </div>
                            {/* Remove Button */}
                            <div className="flex justify-start pt-1">
                              <button
                                onClick={() => removeIdx(idx)}
                                title="Remove"
                                className="text-red-500 hover:text-red-700 transition"
                              >
                               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                              </button>
                            </div>
                          </div>

                          {/* Price, Qty, Subtotal */}
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-gray-600 font-semibold">Price</p>
                              <p className="font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 font-semibold">Qty</p>
                              <div className="flex items-center justify-center border border-gray-300 rounded">
                                <button
                                  onClick={() => changeQty(idx, Math.max(1, item.qty - 1))}
                                  className="px-1.5 py-0.5 text-gray-700 hover:bg-gray-100 font-medium text-sm"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={e => changeQty(idx, Math.max(1, Number(e.target.value) || 1))}
                                  className="w-8 text-center border-l border-r border-gray-300 outline-none px-0.5 py-0.5 text-sm"
                                />
                                <button
                                  onClick={() => changeQty(idx, item.qty + 1)}
                                  className="px-1.5 py-0.5 text-gray-700 hover:bg-gray-100 font-medium text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600 font-semibold">Subtotal</p>
                              <p className="font-bold text-gray-900">₹{itemSubtotal.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
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
