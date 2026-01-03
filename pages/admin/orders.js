import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import AdminLayout from '../../components/AdminLayout';
import { verifyToken } from '../../lib/auth';

export default function AdminOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [ordersPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  const fetchOrders = (page = 1) => {
    setLoading(true);
    fetch(`/api/orders?page=${page}&limit=${ordersPerPage}`)
      .then(r => r.json())
      .then(data => {
        console.log('Orders data received:', JSON.stringify(data, null, 2));
        // Handle both old format (array) and new format (object with data and pagination)
        if (data.data) {
          setOrders(data.data || []);
          setPagination(data.pagination);
        } else {
          setOrders(data || []);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const customerName = order.shippingAddress?.name || ((order.shippingAddress?.firstName || '') + ' ' + (order.shippingAddress?.lastName || '')).trim();
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function updateOrderStatus(orderId, newStatus) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status. Please try again.');
    }
  }

  async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
        alert('Order deleted successfully');
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  }

  const orderStatuses = ['all', 'pending', 'processing', 'completed', 'cancelled'];

  // Helper function to render order detail card
  const renderOrderDetail = (order) => {
    const statusColors = {
      pending: { bg: 'bg-white', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: '📋' },
      processing: { bg: 'bg-white', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: '⚙️' },
      completed: { bg: 'bg-white', border: 'border-green-200', badge: 'bg-green-100 text-green-800', icon: '✓' },
      cancelled: { bg: 'bg-white', border: 'border-red-200', badge: 'bg-red-100 text-red-800', icon: '✕' }
    };
    const colors = statusColors[order.status] || statusColors.pending;

    return (
      <div key={order._id} className={`${colors.bg} border ${colors.border} rounded-lg p-6 space-y-6`}>
        {/* Order Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order #{(order._id || '').slice(-6).toUpperCase()}</h3>
            <div className="mt-1 space-y-1 text-sm text-gray-600">
              <div>
                <span className="font-medium">Customer:</span> {(order.shippingAddress?.name || ((order.shippingAddress?.firstName || '') + ' ' + (order.shippingAddress?.lastName || '')).trim()) || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.shippingAddress?.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {order.shippingAddress?.phone || 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end">
            <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-semibold inline-block`}>
              {colors.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Order Divider */}
        <div className="border-t border-gray-300 opacity-30"></div>

        {/* Order Details Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">📦 Order Details</h4>
          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => {
                const imageUrl = item.product?.images?.[0] || item.productImage;
                const title = item.product?.title || item.productTitle;
                return (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex gap-4 items-start">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={title || 'Product'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/products/placeholder.jpg';
                            }}
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900">{title || 'Product (Deleted)'}</h5>
                        {item.product?.weight && (
                          <p className="text-sm text-gray-500">{item.product.weight}</p>
                        )}
                        <div className="mt-2 flex gap-4 text-sm text-gray-600">
                          <span><strong>Qty:</strong> {item.qty}</span>
                          <span><strong>Price:</strong> ₹{(item.price || 0).toLocaleString('en-IN')}</span>
                          <span className="font-medium"><strong>Subtotal:</strong> ₹{((item.qty || 1) * (item.price || 0)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No items found for this order</p>
            )}
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">₹{(order.total || 0).toLocaleString('en-IN')} INR</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">📍 Order Status</h4>
          <div className="space-y-2">
            {[
              { status: 'pending', label: 'Order Confirmed', icon: '✓' },
              { status: 'processing', label: 'Processing', icon: '⚙️' },
              { status: 'completed', label: 'Delivered', icon: '✓' },
              { status: 'cancelled', label: 'Cancelled', icon: '✕' }
            ].map((step, idx) => {
              const isActive = 
                (step.status === 'pending' && ['pending', 'processing', 'completed'].includes(order.status)) ||
                (step.status === 'processing' && ['processing', 'completed'].includes(order.status)) ||
                (step.status === 'completed' && order.status === 'completed') ||
                (step.status === 'cancelled' && order.status === 'cancelled');
              
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-300 flex-wrap">
          <select
            value={order.status || 'pending'}
            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-600 focus:border-green-600 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => deleteOrder(order._id)}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition flex items-center gap-2"
            title="Delete order"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Order
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout user={user}>
      <Head>
        <title>Manage Orders | Mangaiyar Fresh Foods Admin</title>
      </Head>

      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-7 text-gray-900">
              Orders
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative rounded-md shadow-sm h-10">
              <input
                type="text"
                className="form-input block w-full pl-10 h-full sm:text-sm border border-gray-300 rounded-md focus:ring-green-600 focus:border-green-600"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {orderStatuses.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap h-10 flex items-center ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
            List View
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              viewMode === 'detail'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v16h16V4H4m2 2h12v4H6V6m0 6h12v4H6v-4z"/>
            </svg>
            Detail View
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-green-600 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading orders...
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search or filters' : 'Orders will appear here when customers place them'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map(order => {
                    const statusColors = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      processing: 'bg-blue-100 text-blue-800',
                      completed: 'bg-green-100 text-green-800',
                      cancelled: 'bg-red-100 text-red-800'
                    };
                    const statusColor = statusColors[order.status] || statusColors.pending;
                    const isExpanded = expandedOrderId === order._id;

                    return (
                      <>
                        <tr key={order._id} className={`hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            #{(order._id || '').slice(-6).toUpperCase()}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">
                            {order.shippingAddress?.name || ((order.shippingAddress?.firstName || '') + ' ' + (order.shippingAddress?.lastName || '')).trim() || 'N/A'}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-green-600">
                            ₹{(order.total || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                              className="text-green-600 hover:text-green-900 transition font-semibold"
                            >
                              {isExpanded ? '▼ Hide' : '▶ View'}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded detail row - appears directly below clicked item */}
                        {isExpanded && (
                          <tr key={`expanded-${order._id}`}>
                            <td colSpan="6" className="px-3 sm:px-6 py-6 bg-white border-b-2 border-green-200">
                              <div className="max-w-5xl">
                                {renderOrderDetail(order)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* DETAIL VIEW */
          <div className="grid grid-cols-1 gap-6 auto-rows-max">
            {filteredOrders.map(order => renderOrderDetail(order))}
          </div>
        )}

        {/* Pagination Controls */}
        {orders.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              {(() => {
                const startItem = (currentPage - 1) * ordersPerPage + 1;
                const endItem = Math.min(currentPage * ordersPerPage, pagination.total);
                return (
                  <span>
                    Showing <span className="font-semibold">{startItem}</span> to <span className="font-semibold">{endItem}</span> of <span className="font-semibold">{pagination.total}</span> orders
                  </span>
                );
              })()}
            </div>
            
            <div className="flex gap-2 items-center flex-wrap justify-center sm:justify-end">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  pagination.hasPrevPage
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  pagination.hasNextPage
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            </div>

            {/* Orders Per Page */}
            <div className="text-xs text-gray-500 text-center sm:text-right">
              {orders.length} orders per page
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie || '';
  const token = cookies.split('token=')[1] ? cookies.split('token=')[1].split(';')[0] : null;
  const user = token ? await verifyToken(token) : null;
  
  if (!user || user.role !== 'admin') {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  return { 
    props: { 
      user: { name: user.name, email: user.email }
    } 
  };
}

