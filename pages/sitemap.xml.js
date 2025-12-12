import connectDB  from '../lib/db';
import Product from '../models/Product';
import Category from '../models/Category';
i
const BASE_URL = "https://minukki.in";  // <<< FIXED DOMAIN

function generateSiteMap(products, categories) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

      <!-- Static Pages -->
      <url>
        <loc>${BASE_URL}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>

      <url>
        <loc>${BASE_URL}/products</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>

      <url>
        <loc>${BASE_URL}/about</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>

      <url>
        <loc>${BASE_URL}/contact</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>

      <url>
        <loc>${BASE_URL}/blog</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>

      <!-- Product URLs -->
      ${products
        .map(({ slug, updatedAt }) => {
          return `
      <url>
        <loc>${BASE_URL}/product/${slug}</loc>
        <lastmod>${updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
        })
        .join('')}

      <!-- Category URLs -->
      ${categories
        .map(({ name }) => {
          const slug = name.toLowerCase().replace(/\s+/g, '-');
          return `
      <url>
        <loc>${BASE_URL}/products?category=${slug}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
        })
        .join('')}

    </urlset>
  `;
}

export async function getServerSideProps({ res }) {
  try {
    // IMPORTANT - connect to MongoDB
    await connectDB();

    const products = await Product.find({}, { slug: 1, updatedAt: 1 }).lean();
    const categories = await Category.find({}, { name: 1 }).lean();

    console.log('Products:', products.length);
console.log('Categories:', categories.length);

    const sitemap = generateSiteMap(products || [], categories || []);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error('Error generating sitemap:', error);

    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${BASE_URL}</loc>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>${BASE_URL}/products</loc>
          <priority>0.9</priority>
        </url>
      </urlset>
    `;

    res.setHeader('Content-Type', 'text/xml');
    res.write(basicSitemap);
    res.end();

    return { props: {} };
  }
}


export default function Sitemap() {
  return null;
}
