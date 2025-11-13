import { useState } from 'react';

export default function CartItem({ item, onChangeQty, onRemove }) {
  const imgs = item.product.images || [];
  const subtotal = (item.price * item.qty) || 0;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* Remove Button */}
      <td className="px-6 py-4">
        <button
          onClick={onRemove}
          title="Remove"
          className="text-gray-400 hover:text-red-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </td>

      {/* Product Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
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
      </td>

      {/* Price Column */}
      <td className="px-6 py-4 text-center">
        <div className="font-semibold text-gray-900">₹{item.price}</div>
      </td>

      {/* Quantity Column */}
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center border border-gray-300 rounded overflow-hidden w-24 mx-auto">
          <button
            onClick={() => onChangeQty(Math.max(1, item.qty - 1))}
            className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-medium"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={item.qty}
            onChange={e => onChangeQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-12 text-center border-l border-r border-gray-300 outline-none px-1 py-1"
            aria-label="Quantity"
          />
          <button
            onClick={() => onChangeQty(item.qty + 1)}
            className="px-2 py-1 text-gray-700 hover:bg-gray-100 font-medium"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </td>

      {/* Subtotal Column */}
      <td className="px-6 py-4 text-center">
        <div className="font-bold text-gray-900">₹{subtotal}</div>
      </td>
    </tr>
  );
}
