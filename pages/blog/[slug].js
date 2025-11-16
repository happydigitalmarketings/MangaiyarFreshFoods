import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function BlogPostPage({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-[#8B4513]/20 rounded-lg mb-4"></div>
          <div className="text-[#8B4513]">Loading article...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Article not found</h1>
          <p className="mt-2 text-gray-600">The article you're looking for doesn't exist.</p>
          <Link href="/blog" className="mt-6 inline-flex items-center text-[#8B4513] hover:text-[#703810]">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{post.title} | Minukki Blog</title>
        {/* Strip basic paragraph tags for meta description */}
        <meta
          name="description"
          content={(post.content || '').replace(/<\/p>\s*<p>/gi, '\n\n').replace(/<[^>]+>/g, '').substring(0, 160)}
        />
      </Head>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/blog" className="text-[#8B4513] hover:text-[#703810]">
                  Blog
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-gray-500">{post.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-500 space-x-4">
              <span className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {typeof post.author === 'string' ? post.author : (post.author?.name || 'Unknown')}
              </span>
              <span>•</span>
              <time dateTime={post.createdAt} className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>

          { (post.featuredImage || post.image) && (
            <div className="mb-12 aspect-[16/9] relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.featuredImage || post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#8B4513] prose-a:no-underline hover:prose-a:text-[#703810]">
            {(() => {
              const raw = post.content || '';
              // Convert closing/opening p tags into paragraph breaks, then strip remaining tags
              const normalized = raw.replace(/<\/p>\s*<p>/gi, '\n\n').replace(/<[^>]+>/g, '');
              const paras = normalized.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
              return paras.map((paragraph, index) => (
                <p key={index} className="mb-6">{paragraph}</p>
              ));
            })()}
          </div>

          {/* Share and Navigation */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-[#8B4513] hover:text-[#703810]"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Blog
              </button>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-[#8B4513]" title="Share on Facebook">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-[#8B4513]" title="Share on Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  try {
    // Construct base URL from the request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    
    const res = await fetch(`${baseUrl}/api/blog/${params.slug}`);
    if (!res.ok) {
      throw new Error('Post not found');
    }
    const post = await res.json();
    return {
      props: { post }
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      props: { post: null }
    };
  }
}