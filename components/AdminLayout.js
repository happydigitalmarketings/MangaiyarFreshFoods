import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function AdminLayout({ children, user }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: 'grid', label: 'Dashboard', href: '/admin' },
    { icon: 'box', label: 'Products', href: '/admin/products' },
    { icon: 'shopping-bag', label: 'Orders', href: '/admin/orders' },
    { icon: 'file-text', label: 'Blog Posts', href: '/admin/blogs' },
    { icon: 'mail', label: 'Contact Messages', href: '/admin/contacts' },
    { icon: 'bar-chart-2', label: 'Sales Reports', href: '/admin/reports' },
  ];

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            
            <div className="hidden lg:flex items-center">
              {/* Logo/Brand - optional */}
            </div>
            
            {/* Admin Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-sm text-gray-700">
                Welcome, {typeof user?.name === 'string' ? user.name : (user?.name?.name || 'Admin')}
              </span>
              <button 
                onClick={() => {
                  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                  router.push('/admin/login');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative w-64 h-full bg-white shadow-sm border-r border-gray-200 transition-transform duration-300 ease-in-out z-30`}
        >
          <nav className="mt-5 px-2 space-y-1 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#8B4513]/10 text-[#8B4513]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#8B4513]'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-[#8B4513]' : 'text-gray-500'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={getIconPath(item.icon)}
                    />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function getIconPath(icon) {
  switch (icon) {
    case 'grid':
      return 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z';
    case 'box':
      return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
    case 'shopping-bag':
      return 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z';
    case 'file-text':
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    case 'mail':
      return 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
    case 'bar-chart-2':
      return 'M18 20V10M12 20V4M6 20v-6';
    default:
      return '';
  }
}