import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { verifyToken } from '../../lib/auth';

export default function AdminBlog({ user }) {
  const safeUserName = typeof user?.name === 'string' ? user.name : (user?.name?.name || '');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    author: safeUserName,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    // client-side validation
    if (!formData.title || !formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content || !formData.content.trim()) {
      setError('Content is required');
      return;
    }
    setSubmitting(true);
    
    try {
        const form = new FormData();
        form.append('title', formData.title);
        form.append('content', formData.content);
        form.append('excerpt', formData.excerpt);
        form.append('tags', formData.tags);
        if (imageFile) {
          form.append('image', imageFile);
        }

        const response = await fetch('/api/blog', {
          method: 'POST',
          body: form,
        });

      if (response.ok) {
        setSuccess('Blog post created successfully!');
          setFormData({ title: '', content: '', excerpt: '', tags: '', author: safeUserName });
          // clear selected file and preview (revoke object URL to free memory)
          setImageFile(null);
          setPreviewUrl(prev => {
            if (prev) try { URL.revokeObjectURL(prev); } catch(e) {}
            return null;
          });
        fetchPosts();
      } else {
        const data = await response.json().catch(() => ({}));
          setError(data.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create blog post');
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(postId, currentStatus) {
    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        fetchPosts();
      } else {
        setError('Failed to update post status');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post status');
    }
  }

  async function deletePost(postId) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
        setSuccess('Post deleted successfully');
      } else {
        setError('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  }

  return (
    <AdminLayout user={user}>
      <Head>
        <title>Manage Blog | Minukki Admin</title>
      </Head>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Manage Blog
            </h2>
          </div>
        </div>

        {/* Create Post Form */}
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Create New Post
            </h3>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{success}</h3>
                  </div>
                </div>
              </div>
            )}

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
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="content"
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Featured Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setImageFile(f);
                    if (f) {
                      const url = URL.createObjectURL(f);
                      setPreviewUrl(url);
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                />

                {previewUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={previewUrl} alt="Preview" className="w-32 h-20 object-cover rounded-md border" />
                    <button type="button" onClick={() => { setImageFile(null); URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }} className="text-sm text-red-600">Remove</button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt (optional)
                </label>
                <textarea
                  id="excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#8B4513] focus:border-[#8B4513] sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B4513] hover:bg-[#703810]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513]`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              All Posts
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-[#8B4513] transition ease-in-out duration-150 cursor-not-allowed">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading posts...
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Title
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Author
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Date
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {posts.map((post) => {
                          const authorName = typeof post.author === 'string' ? post.author : (post.author?.name || 'Unknown');
                          return (
                          <tr key={post._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {post.title}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {authorName}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {post.published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => togglePublish(post._id, post.published)}
                                className="text-[#8B4513] hover:text-[#703810] mr-4"
                              >
                                {post.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => deletePost(post._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          );
                        })}

                        {posts.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-gray-500">
                              No blog posts found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
  // Defensive: ensure user.name is always a string
  const safeName = typeof user.name === 'string' ? user.name : (user.name?.name || '');
  return { props: { user: { name: safeName, email: user.email } } };
}