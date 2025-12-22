import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { verifyToken } from '../../lib/auth';
import Image from 'next/image';

export default function BannersPage({ user }) {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    image: '',
    link: '/',
    cta: 'Learn More',
    order: 0,
    active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch('/api/upload?type=banner', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        image: data.url,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner._id);
      setFormData({
        title: banner.title,
        text: banner.text,
        image: banner.image,
        link: banner.link,
        cta: banner.cta || 'Learn More',
        order: banner.order,
        active: banner.active,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        text: '',
        image: '',
        link: '/',
        cta: 'Learn More',
        order: banners.length,
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      text: '',
      image: '',
      link: '/',
      cta: 'Learn More',
      order: 0,
      active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.text || !formData.image) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const method = editingBanner ? 'PATCH' : 'POST';
      const body = editingBanner 
        ? { id: editingBanner, ...formData }
        : formData;

      console.log('Sending banner data:', body); // Debug log

      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save banner');

      const responseData = await res.json();
      console.log('Server response:', responseData); // Debug log

      await fetchBanners();
      handleCloseModal();
      alert(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch('/api/admin/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchBanners();
      alert('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-serif text-green-600">Manage Banners</h1>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Banner
          </button>
        </div>

        {/* Banners Grid */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Loading banners...
            </div>
          ) : banners.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No banners found. Create your first banner!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {banners.map((banner) => (
                <div key={banner._id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Banner Image */}
                    <div className="w-full sm:w-48 h-32 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                      {banner.image ? (
                        <Image
                          src={banner.image}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {banner.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{banner.text}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p><strong>Link:</strong> {banner.link}</p>
                            <p><strong>Order:</strong> {banner.order}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleOpenModal(banner)}
                            className="px-3 py-2 text-sm font-medium text-[#8B4513] bg-white border border-[#8B4513] rounded-lg hover:bg-[#8B4513]/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Banner title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text/Description *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Banner text or description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image *
                </label>
                <div className="space-y-3">
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-300">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded hover:bg-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Upload Input */}
                  <label className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading ? 'bg-gray-50 border-gray-300' : 'border-gray-300 hover:border-[#8B4513] hover:bg-[#8B4513]/5'
                  }`}>
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="/"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text (CTA)
                </label>
                <input
                  type="text"
                  name="cta"
                  value={formData.cta}
                  onChange={handleChange}
                  placeholder="Learn More"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Call-to-action button text</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#8B4513] rounded border-gray-300 focus:ring-2 focus:ring-[#8B4513]"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#8B4513] rounded-lg hover:bg-[#703810]"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
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
