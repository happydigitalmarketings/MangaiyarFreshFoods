import React from 'react';
import { verifyToken } from '../../lib/auth';
import connectDB from '../../lib/db';
import AdminLayout from '../../components/AdminLayout';

// Dynamic imports for models to ensure they're loaded after DB connection
let Order;
let Product;

export default function AdminIndex({ user, stats }) {
  // Ensure stats has default values
  const safeStats = {
    totalOrders: stats?.totalOrders || 0,
    totalProducts: stats?.totalProducts || 0,
    totalRevenue: stats?.totalRevenue || 0,
    pendingOrders: stats?.pendingOrders || 0,
    recentOrders: stats?.recentOrders || [],
  };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#8B4513]">Dashboard Overview</h1>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Orders', value: safeStats.totalOrders, icon: 'shopping-bag' },
            { label: 'Completed Orders', value: safeStats.totalProducts, icon: 'box' },
            { label: 'Revenue', value: `₹${(safeStats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: 'dollar-sign' },
            { label: 'Pending Orders', value: safeStats.pendingOrders, icon: 'clock' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-2 truncate">{stat.value}</p>
                </div>
                <div className="hidden sm:flex w-12 h-12 bg-[#8B4513]/10 rounded-full flex-shrink-0 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       className="h-6 w-6 text-[#8B4513]"
                       fill="none" 
                       viewBox="0 0 24 24" 
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconPath(stat.icon)} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeStats.recentOrders && safeStats.recentOrders.length > 0 ? (
                  safeStats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        #{(order._id || '').slice(-6).toUpperCase()}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order?.shippingAddress?.name || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                        ₹{(order?.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order?.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order?.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-sm">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
function getIconPath(icon) {
  switch (icon) {
    case 'shopping-bag':
      return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z';
    case 'box':
      return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
    case 'dollar-sign':
      return 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6';
    case 'clock':
      return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
    default:
      return '';
  }
}

export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie || '';
  const token = cookies.split('token=')[1] ? cookies.split('token=')[1].split(';')[0] : null;
  const user = token ? await verifyToken(token) : null;
  
  if (!user || user.role !== 'admin') {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  let totalOrders = 0;
  let totalProducts = 0;
  let recentOrders = [];
  let pendingOrdersCount = 0;
  let totalRevenue = 0;

  try {
    await connectDB();

    // Dynamically import models after DB connection
    Order = (await import('../../models/Order')).default;
    Product = (await import('../../models/Product')).default;

    // Get order statistics
    [
      totalOrders,
      totalProducts,
      recentOrders,
      pendingOrdersCount,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id total status createdAt shippingAddress')
        .lean(),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).then(result => result[0]?.total || 0)
    ]);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
  }

  return { 
    props: { 
      user: { name: user.name, email: user.email },
      stats: {
        totalOrders,
        totalProducts,
        totalRevenue,
        pendingOrders: pendingOrdersCount,
        recentOrders: JSON.parse(JSON.stringify(recentOrders))
      }
    } 
  };
}
