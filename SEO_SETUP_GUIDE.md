# SEO Setup - Step by Step Guide

## Step 1: Submit Sitemap to Google Search Console

### What it does:
Tells Google about all your pages so they get indexed faster.

### How to do it:

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Sign in with your Google account

2. **Add your website**
   - Click "Add property" (top left)
   - Enter your domain: `https://www.yourdomain.com`
   - Click "Continue"

3. **Verify ownership** (Choose one method)
   - **DNS record method** (Easiest for most)
     - Go to your domain registrar (GoDaddy, Namecheap, etc.)
     - Add DNS TXT record Google provides
     - Wait 5-10 minutes for verification
   
   - **HTML file method**
     - Download HTML file from Google
     - Upload to your website root folder
     - Verify in Google Search Console

4. **Submit sitemap**
   - In Search Console, click "Sitemaps" (left menu)
   - Paste: `https://yourdomain.com/sitemap.xml`
   - Click "Submit"
   - Wait 1-2 days for Google to crawl

✅ **Done!** Google now knows about all your pages.

---

## Step 2: Add Google Analytics

### What it does:
Tracks visitor behavior, traffic sources, and conversions.

### How to do it:

1. **Create Google Analytics Account**
   - Visit: https://analytics.google.com
   - Sign in with Google account
   - Click "Start measuring"

2. **Get Tracking Code**
   - Account name: "Mangaiyar Fresh Foods"
   - Property name: "Website"
   - Choose timezone and currency
   - Click "Create"
   - Copy the **Measurement ID** (looks like: `G-XXXXXXXXXX`)

3. **Add to your Next.js website**
   
   **Option A: Using next/script (Easiest)**
   
   Open `/pages/_app.js` and add:
   
   ```javascript
   import Script from 'next/script';
   
   export default function App({ Component, pageProps }) {
     return (
       <>
         {/* Google Analytics */}
         <Script strategy="afterInteractive"
           src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
         />
         <Script
           id="google-analytics"
           strategy="afterInteractive"
           dangerouslySetInnerHTML={{
             __html: `
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', 'G-XXXXXXXXXX');
             `,
           }}
         />
         
         {/* Rest of your app */}
         <BrandContext.Provider value={brand}>
           {!isAdminPage && <Header />}
           {!isAdminPage && <Marquee />}
           {!isAdminPage && <FloatingWhatsApp />}
           <Component {...pageProps} />
         </BrandContext.Provider>
       </>
     );
   }
   ```
   
   **Replace `G-XXXXXXXXXX` with your Measurement ID**

4. **Verify it's working**
   - Deploy your website
   - Visit your site
   - Go to Google Analytics → Real-time
   - See yourself as an active user

✅ **Done!** You can now track visitor behavior.

---

## Step 3: Update Domain URLs in SEO Library

### What it does:
Tells the SEO helpers what your actual domain is.

### How to do it:

1. **Find your domain**
   - If live: `https://www.yourdomain.com`
   - If local: Keep as is for testing

2. **Edit `/lib/seo.js`**
   
   Find this section at the top:
   ```javascript
   export const defaultSEO = {
     siteName: 'Mangaiyar Fresh Foods',
     description: 'Discover exquisite traditional Kerala sarees...',
     url: 'https://minukki.in',  // ← CHANGE THIS
     image: 'https://minukki.in/images/logo.jpg',  // ← CHANGE THIS
     twitterHandle: '@minukkisarees',  // ← OPTIONAL
   };
   ```
   
   Replace `https://minukki.in` with your actual domain.

3. **If you have social media accounts, update:**
   ```javascript
   sameAs: [
     'https://www.facebook.com/yourpage',
     'https://www.instagram.com/yourprofile',
     'https://www.youtube.com/yourchannel',
   ],
   ```

✅ **Done!** All SEO tags will now show correct URLs.

---

## Step 4: Test with Google PageSpeed Insights

### What it does:
Checks how fast your website is and gives SEO tips.

### How to do it:

1. **Go to PageSpeed Insights**
   - Visit: https://pagespeed.web.dev
   
2. **Enter your website URL**
   - Paste: `https://yourdomain.com`
   - Click "Analyze"

3. **Wait for results** (takes 30-60 seconds)

4. **Review the score**
   - **90+** = Good ✅
   - **50-89** = Needs work ⚠️
   - **Below 50** = Critical issues ❌

5. **Fix issues** (in order of importance)
   - **Lazy load images**: Add `loading="lazy"` to `<Image>` tags
   - **Minimize CSS/JS**: Next.js does this automatically
   - **Cache**: Add cache headers (already in next.config.js)

✅ **Done!** You know your site speed and what to fix.

---

## Step 5: Create Blog Content with Internal Links

### What it does:
More content = better SEO ranking. Internal links help crawlers understand your site.

### How to do it:

1. **Create a blog post page** (if you don't have one)
   
   Already exists: `/pages/blog/[slug].js`

2. **Write blog content about sarees**
   
   Example topics:
   - "How to Choose the Perfect Kasavu Saree"
   - "Traditional Kerala Sarees: A Complete Guide"
   - "Saree Care Tips: Preserve Your Heirloom Fabrics"
   - "Understanding Tissue Sarees: Quality & Price Guide"

3. **Add internal links in your blog posts**
   
   ```markdown
   In your blog post, mention:
   - "Check out our [Kasavu Saree collection](/products?category=kasavu-sarees)"
   - "Browse all [Traditional Sarees](/products)"
   - "Learn more [About our heritage](/about)"
   ```

4. **Link back to blog from products**
   
   Example: Add a blog section to `/pages/products.js`:
   ```javascript
   <section>
     <h3>Related Blog Posts</h3>
     <ul>
       <li><Link href="/blog/kasavu-guide">Kasavu Saree Guide</Link></li>
       <li><Link href="/blog/saree-care">Saree Care Tips</Link></li>
     </ul>
   </section>
   ```

5. **Publishing tips**
   - Write 500-2000 words per post
   - Use target keywords naturally (e.g., "Kerala sarees")
   - Add images with good alt text
   - Update blog regularly (weekly or monthly)

✅ **Done!** You've created SEO-friendly content.

---

## Step 6: Add Product Detail Pages with Product Schema

### What it does:
Makes your products show up with ratings & prices in search results.

### How to do it:

1. **Check if `/pages/product/[slug].js` exists**
   - If yes, continue to step 2
   - If no, create it (you likely have it)

2. **Add product schema to the page**
   
   At the top of `/pages/product/[slug].js`:
   ```javascript
   import { generateSchema } from '../../lib/seo';
   import Head from 'next/head';
   
   export default function ProductDetail({ product }) {
     // Generate product schema
     const productSchema = generateSchema('Product', {
       name: product.name,
       description: product.description,
       price: product.price,
       image: product.images || [product.image],
       rating: product.averageRating || 4.5,
       reviewCount: product.reviewCount || 0,
     });
     
     return (
       <>
         <Head>
           <title>{product.name} - Buy Online | Mangaiyar Fresh Foods</title>
           <meta name="description" content={product.description?.substring(0, 160)} />
           <meta property="og:title" content={product.name} />
           <meta property="og:description" content={product.description} />
           <meta property="og:image" content={product.image} />
           <link rel="canonical" href={`https://yourdomain.com/product/${product.slug}`} />
           
           {/* Product Schema */}
           <script type="application/ld+json">
             {JSON.stringify(productSchema)}
           </script>
         </Head>
         
         {/* Rest of your product page */}
       </>
     );
   }
   ```

3. **Add customer reviews section**
   ```javascript
   <section>
     <h2>Customer Reviews</h2>
     {product.reviews?.map(review => (
       <div key={review._id}>
         <p>⭐ {review.rating}/5</p>
         <p>{review.comment}</p>
       </div>
     ))}
   </section>
   ```

4. **Test with Google's Rich Results Test**
   - Visit: https://search.google.com/test/rich-results
   - Paste your product URL
   - Verify schema shows correctly

✅ **Done!** Your products will show ratings in search results.

---

## 🎯 Priority Order

If you can only do a few, do these first:

1. **Step 3** (5 min) - Update domain URLs
2. **Step 1** (10 min) - Submit sitemap to Google
3. **Step 2** (15 min) - Add Google Analytics
4. **Step 4** (10 min) - Test page speed
5. **Step 5** (varies) - Start writing blog posts
6. **Step 6** (20 min) - Add product schema

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Google Search Console shows your site
- [ ] Sitemap submitted and indexed
- [ ] Google Analytics shows real-time visitors
- [ ] PageSpeed Insights score is 70+ 
- [ ] Blog posts are published with internal links
- [ ] Product pages show ratings in Google search results
- [ ] All meta descriptions show correctly
- [ ] Mobile site looks good
- [ ] No broken links on site
- [ ] HTTPS is enabled (green lock icon)

---

## 📞 Support

If you get stuck on any step:

1. Check Google's official guides:
   - https://developers.google.com/search
   - https://analytics.google.com/analytics/academy/

2. Test tools:
   - https://search.google.com/test/rich-results
   - https://pagespeed.web.dev
   - https://www.schema.org/docs/schemas.html

3. Monitor progress:
   - Google Search Console (indexation, clicks)
   - Google Analytics (visitor behavior)
   - Google PageSpeed Insights (performance)

---

**Estimated Time to Complete All Steps: 1-2 hours**

Good luck! 🚀
