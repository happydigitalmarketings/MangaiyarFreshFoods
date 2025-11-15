import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '../../../components/AdminLayout';
import { verifyToken } from '../../../lib/auth';

export default function AdminBlogs({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  async function togglePostStatus(slug, currentStatus) {
    try {
      const response = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        fetchPosts();
        setSuccess('Post status updated successfully');
      } else {
        setError('Failed to update post status');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post status');
    }
  }

  async function deletePost(slug) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
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
              Blog Posts
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/admin/blogs/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium btn-primary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => (
                <li key={post._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {(post.featuredImage || post.image) && (
                          <div className="flex-shrink-0 h-16 w-16 mr-4">
                            <Image
                              className="h-16 w-16 rounded-lg object-cover"
                              src={post.featuredImage || post.image}
                              alt={post.title}
                              width={64}
                              height={64}
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#8B4513] truncate">
                            {post.title}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500 gap-2">
                            <p>By {typeof post.author === 'string' ? post.author : (post.author?.name || 'Unknown')}</p>
                            <span className="mx-2">•</span>
                            <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                            {post.publishedAt && (
                              <>
                                <span className="mx-2">•</span>
                                <p className="text-sm text-green-600">Published {new Date(post.publishedAt).toLocaleDateString()}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Link href={`/admin/blogs/${post.slug || post._id}`} legacyBehavior>
                          <a aria-label={`Edit ${post.title}`} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-[#8B4513] text-white hover:bg-[#703810]">Edit</a>
                        </Link>
                        <button
                          onClick={() => togglePostStatus(post.slug, post.published)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            post.published
                              ? 'text-yellow-600 hover:text-yellow-700'
                              : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => deletePost(post.slug)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {posts.length === 0 && !loading && (
                <li>
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new blog post.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/admin/blogs/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B4513] hover:bg-[#703810]"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Post
                      </Link>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const user = await verifyToken(req);
    if (!user || !user.isAdmin) {
      return {
        redirect: {
          destination: '/admin/login',
          permanent: false,
        },
      };
    }
    return { props: { user } };
  } catch (err) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
}