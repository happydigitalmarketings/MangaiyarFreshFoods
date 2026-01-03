import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';

export default function ProductEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState({ title: '', slug: '', description: '', price: 0, mrp: 0, stock: 0, weight: '', weightVariants: [], images: [], categories: [], order: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const urlInputRef = useRef(null);

  // Fetch categories from API
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => {
        const activeCategories = d.filter(c => c.active).sort((a, b) => a.order - b.order);
        setCategories(activeCategories);
        setCategoriesLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setCategoriesLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError('');
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          // Try to parse error message, otherwise read as text
          const txt = await res.text();
          try {
            const parsed = JSON.parse(txt);
            throw new Error(parsed.message || 'Failed to load product');
          } catch (e) {
            // if txt is empty or not JSON
            throw new Error(txt || `Request failed (${res.status})`);
          }
        }
        // safe to parse JSON
        return res.json();
      })
      .then((d) => {
        if (!mounted) return;
        if (d) setData(d);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to fetch product');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const sanitizeSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const endpoint = id ? `/api/products/${id}` : '/api/products';
      const method = id ? 'PUT' : 'POST';
      
      // Always sanitize slug from title
      const submitData = {
        ...data,
        slug: sanitizeSlug(data.title)
      };
      
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitData) });
      if (!res.ok) {
        const txt = await res.text();
        let errorMsg = 'Save failed';
        try { 
          const parsed = JSON.parse(txt); 
          errorMsg = parsed.message || 'Save failed';
        } catch { 
          errorMsg = txt || `Save failed (${res.status})`;
        }
        setError(errorMsg);
        setToastMessage(errorMsg);
        setToastType('error');
        throw new Error(errorMsg);
      }
      const successMsg = 'Product saved successfully!';
      setSuccess(successMsg);
      setToastMessage(successMsg);
      setToastType('success');
      // small delay so the admin sees the success state
      setTimeout(() => router.push('/admin/products'), 600);
    } catch (err) {
      const errorMsg = err.message || 'Failed to save product';
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastType('error');
    }
  }

  async function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    
    console.log('Starting upload for', files.length, 'files');
    setUploading(true);
    setUploadError('');
    
    try {
      for (const file of files) {
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image. Only image files are allowed.`);
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('Sending to /api/upload...');
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Upload failed - no details' }));
          throw new Error(errorData.error || errorData.message || `Upload failed with status ${res.status}`);
        }
        
        const result = await res.json();
        console.log('✓ Upload successful:', result.url);
        
        setData(prev => ({
          ...prev,
          images: [...(prev.images || []), result.url]
        }));
      }
      
      setUploadError('');
      console.log('All uploads completed successfully');
    } catch (err) {
      const errorMsg = err.message || 'Failed to upload image';
      console.error('Upload error:', errorMsg, err);
      setUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  }

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
  };

  return (
    <AdminLayout user={null} activeMenu="/admin/products">
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')}
      />
      <div className="mx-auto py-6 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{id ? 'Edit' : 'Create'} Product</h1>
          <p className="mt-2 text-sm text-gray-500">Use this form to {id ? 'update' : 'create'} a product. Changes will be saved to the database.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          {loading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-[#8B4513]">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading product...
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900">Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                value={data.title}
                onChange={e => setData({ ...data, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Slug</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                value={data.slug}
                onChange={e => setData({ ...data, slug: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900">MRP Price</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pl-7 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    value={data.mrp}
                    onChange={e => setData({ ...data, mrp: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Offer Price</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pl-7 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    value={data.price}
                    onChange={e => setData({ ...data, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="block text-sm font-medium text-gray-900">Stock</label>
              <input
                type="number"
                min="0"
                className="w-24 rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                value={data.stock}
                onChange={e => setData({ ...data, stock: Number(e.target.value) })}
                disabled={data.stock === 0}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.stock === 0}
                  onChange={e => setData({ ...data, stock: e.target.checked ? 0 : 1 })}
                />
                <span className="text-sm">Out of Stock</span>
              </label>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <label className="block text-sm font-medium text-gray-900">Display Order</label>
              <input
                type="number"
                min="0"
                className="w-24 rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                value={data.order}
                onChange={e => setData({ ...data, order: Number(e.target.value) })}
              />
              <span className="text-xs text-gray-500">(Lower numbers appear first)</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Weight/Unit</label>
              <input
                type="text"
                placeholder="e.g., 1 kg, 1 dozen, 500g, 1 litre"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                value={data.weight || ''}
                onChange={e => setData({ ...data, weight: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">Specify the unit/quantity like "1 kg", "1 dozen", "500g", "1 litre", etc.</p>
            </div>

            {/* Weight Variants Section */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Weight Variants</h3>
                <button
                  type="button"
                  onClick={() => {
                    const newVariant = { weight: '', price: 0, mrp: 0, stock: 0 };
                    setData({ ...data, weightVariants: [...(data.weightVariants || []), newVariant] });
                  }}
                  className="px-3 py-1 bg-[#8B4513] text-white rounded-md text-sm font-medium hover:bg-[#703810]"
                >
                  + Add Variant
                </button>
              </div>

              {data.weightVariants && data.weightVariants.length > 0 ? (
                <div className="space-y-4">
                  {data.weightVariants.map((variant, idx) => (
                    <div key={idx} className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Variant {idx + 1}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setData({ ...data, weightVariants: data.weightVariants.filter((_, i) => i !== idx) });
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                          <input
                            type="text"
                            placeholder="e.g., 100 g, 250 g, 1 kg"
                            className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                            value={variant.weight}
                            onChange={(e) => {
                              const updated = [...data.weightVariants];
                              updated[idx].weight = e.target.value;
                              setData({ ...data, weightVariants: updated });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                          <input
                            type="number"
                            min="0"
                            className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                            value={variant.stock || 0}
                            onChange={(e) => {
                              const updated = [...data.weightVariants];
                              updated[idx].stock = Number(e.target.value);
                              setData({ ...data, weightVariants: updated });
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pl-7 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                              value={variant.mrp || 0}
                              onChange={(e) => {
                                const updated = [...data.weightVariants];
                                updated[idx].mrp = Number(e.target.value);
                                setData({ ...data, weightVariants: updated });
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 pl-7 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                              value={variant.price || 0}
                              onChange={(e) => {
                                const updated = [...data.weightVariants];
                                updated[idx].price = Number(e.target.value);
                                setData({ ...data, weightVariants: updated });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">No variants added. Click "+ Add Variant" to add weight options.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Categories</label>
              {categoriesLoading ? (
                <div className="text-sm text-gray-600">Loading categories...</div>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {categories.map((cat) => {
                      const active = data.categories && data.categories.includes(cat.name);
                      return (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            setData(prev => {
                              const list = new Set(prev.categories || []);
                              if (list.has(cat.name)) list.delete(cat.name);
                              else list.add(cat.name);
                              return { ...prev, categories: Array.from(list) };
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${active ? 'bg-[#8B4513] text-white border-[#8B4513]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>

                  {data.categories && data.categories.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">Selected: {data.categories.join(', ')}</p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Product Images</label>
              {data.images && data.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">Current Images ({data.images.length})</p>
                  <div className="grid grid-cols-3 gap-4">
                    {data.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                          <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setData({ ...data, images: data.images.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(Array.from(e.dataTransfer.files));
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#8B4513] hover:bg-orange-50 transition-colors"
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">
                    <label htmlFor="file-upload" className="cursor-pointer font-medium text-[#8B4513] hover:text-[#703810]">
                      Click to upload
                    </label>
                    {' '}or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                    disabled={uploading}
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    ref={urlInputRef}
                    type="url"
                    placeholder="Or paste image URL here"
                    className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const url = e.target.value.trim();
                        if (url) {
                          setData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
                          if (urlInputRef.current) {
                            urlInputRef.current.value = '';
                          }
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = urlInputRef.current?.value.trim();
                      if (url) {
                        setData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
                        if (urlInputRef.current) {
                          urlInputRef.current.value = '';
                        }
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {uploading && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="inline-flex items-center text-sm text-[#8B4513]">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading images...
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">Description</label>
              <textarea
                rows={6}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                value={data.description}
                onChange={e => setData({ ...data, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B4513] hover:bg-[#703810] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513]"
              >
                {id ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
