import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function Blog({ posts }) {
  const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '');
  return (
    <div className="min-h-screen bg-white pt-4">
      <Head>
        <title>Blog | Minukki Sarees</title>
        <meta name="description" content="Discover the elegance of Indian sarees through our curated articles" />
      </Head>

      <div className="bg-[#8B4513]/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#8B4513] text-center">
            Blog & Style Guide
          </h1>
          <p className="mt-4 text-lg text-gray-600 text-center max-w-3xl mx-auto">
            Explore our collection of articles about saree styling, care tips, and the rich heritage of Indian textiles
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post) => (
            <div key={post._id} className="group cursor-pointer">
              <Link href={`/blog/${post.slug}`}>
                <>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      src={post.featuredImage || post.image}
                      alt={post.title}
                      width={600}
                      height={450}
                    />
                    <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0"/>
                  </div>
                  <div className="mt-6 flex flex-col">
                    <span className="text-sm text-[#8B4513] font-medium">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-[#8B4513] line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-base text-gray-500 line-clamp-3">
                      {stripHtml(post.content).substring(0, 150)}...
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#8B4513]">
                        By {typeof post.author === 'string' ? post.author : (post.author?.name || 'Unknown')}
                      </span>
                      <span className="inline-flex items-center text-sm font-medium text-[#8B4513] group-hover:translate-x-1 transition-transform duration-200">
                        Read More
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </>
              </Link>
            </div>
          ))}

          {(!posts || posts.length === 0) && (
            <div className="col-span-3 text-center py-12">
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back soon for new articles!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Construct base URL from the request
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const baseUrl = `${protocol}://${req.headers.host}`;
    
    const response = await fetch(`${baseUrl}/api/blog`);
    const posts = await response.json();
    return {
      props: {
        posts: posts.filter(post => post.published),
      },
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return {
      props: {
        posts: [],
      },
    };
  }
}
