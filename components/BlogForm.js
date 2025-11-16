import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Import the editor component dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function BlogForm({ user, postId }) {
  const router = useRouter();
  const isEditing = Boolean(postId);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featuredImage: '',
    excerpt: '',
    tags: [],
    published: false,
    slug: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  async function fetchPost() {
    try {
      const response = await fetch(`/api/blog/${encodeURIComponent(postId)}`);
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setFormData({
        title: data.title,
        content: data.content,
        featuredImage: data.featuredImage || '',
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        published: Boolean(data.publishedAt),
        slug: data.slug || ''
      });
      if (data.featuredImage) {
        setPreviewUrl(data.featuredImage);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = formData.slug ? `/api/blog/${encodeURIComponent(formData.slug)}` : '/api/blog';
      const method = postId ? 'PUT' : 'POST';

      // If an image file is selected, send multipart/form-data so API can accept uploads
      let response;
      if (imageFile) {
        const form = new FormData();
        form.append('title', formData.title);
        form.append('content', formData.content);
        form.append('excerpt', formData.excerpt || '');
        form.append('tags', (formData.tags || []).join(','));
        form.append('slug', formData.slug || '');
        if (formData.published) form.append('published', 'true');
        form.append('image', imageFile);

        response = await fetch(url, {
          method,
          body: form,
        });
      } else {
        const postData = {
          ...formData,
          publishedAt: formData.published ? new Date().toISOString() : null
        };
        delete postData.published;
        response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
      }

      if (response.ok) {
        setSuccess('Post saved successfully');
        if (!postId) {
          setFormData({
              title: '',
              content: '',
              featuredImage: '',
              excerpt: '',
              tags: [],
              published: false
          });
            if (previewUrl) {
              try { URL.revokeObjectURL(previewUrl); } catch(e) {}
              setPreviewUrl(null);
            }
            setImageFile(null);
        }
        router.push('/admin/blogs');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {isEditing ? 'Edit Post' : 'New Blog Post'}
          </h2>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
                Featured Image
              </label>
              <input
                type="file"
                id="featuredImage"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setImageFile(f);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setPreviewUrl(url);
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />

              {previewUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={previewUrl} alt="Preview" className="w-48 h-28 object-cover rounded-md border" />
                  <div>
                    <button type="button" onClick={() => { setImageFile(null); if (previewUrl && previewUrl.startsWith('blob:')) try { URL.revokeObjectURL(previewUrl); } catch(e) {}; setPreviewUrl(null); }} className="text-sm text-red-600">Remove</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                placeholder="Brief summary of the blog post..."
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <div className="mt-1">
                <ReactQuill
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  modules={modules}
                  formats={formats}
                  className="h-64 sm:h-96"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-[#8B4513] focus:ring-[#8B4513] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="published" className="font-medium text-gray-700">
                  Publish immediately
                </label>
                <p className="text-gray-500">
                  When checked, the post will be published right away. Otherwise, it will be saved as a draft.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/blogs')}
                className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}