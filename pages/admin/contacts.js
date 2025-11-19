import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { verifyToken } from '../../lib/auth';
import connectDB from '../../lib/db';

export default function ContactsPage({ user }) {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const limit = 20;
  const pages = Math.ceil(total / limit);

  useEffect(() => {
    fetchContacts();
  }, [filter, search, page]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filter,
        search: search,
        page: page,
        limit: limit,
      });

      const res = await fetch(`/api/admin/contacts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');
      await fetchContacts();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    if (contact.status === 'new') {
      handleStatusChange(contact._id, 'read');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#8B4513]">Contact Messages</h1>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] text-sm"
              >
                <option value="all">All Messages</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 sm:px-6 text-center text-gray-500">
              Loading messages...
            </div>
          ) : contacts.length === 0 ? (
            <div className="px-4 py-12 sm:px-6 text-center text-gray-500">
              No messages found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Name
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {contact.name}
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 truncate">
                          {contact.email}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                          {contact.subject}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <select
                            value={contact.status}
                            onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              contact.status
                            )} border-0 cursor-pointer`}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {new Date(contact.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewDetails(contact)}
                            className="text-[#8B4513] hover:text-[#703810] font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Page {page} of {pages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pages, page + 1))}
                    disabled={page === pages}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for viewing full message */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Message Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Name
                </label>
                <p className="text-gray-900 mt-1 text-sm break-words">{selectedContact.name}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Email
                </label>
                <p className="text-gray-900 mt-1 text-sm break-all">{selectedContact.email}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Subject
                </label>
                <p className="text-gray-900 mt-1 text-sm break-words">{selectedContact.subject}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Message
                </label>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-1 text-gray-900 text-xs sm:text-sm whitespace-pre-wrap overflow-auto max-h-48">
                  {selectedContact.message}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Received on
                </label>
                <p className="text-gray-900 mt-1 text-sm">
                  {new Date(selectedContact.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Status
                </label>
                <select
                  value={selectedContact.status}
                  onChange={(e) => {
                    handleStatusChange(selectedContact._id, e.target.value);
                    setSelectedContact({
                      ...selectedContact,
                      status: e.target.value,
                    });
                  }}
                  className={`w-full mt-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg ${getStatusColor(
                    selectedContact.status
                  )} border-0 cursor-pointer`}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedContact._id);
                  setShowModal(false);
                }}
                className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
      user: { name: user.name, email: user.email },
    },
  };
}
