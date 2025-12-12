// SEO utilities for meta tags and structured data

export const defaultSEO = {
  siteName: 'Minukki Sarees',
  description: 'Discover exquisite traditional Kerala sarees, handcrafted with love and heritage. Kasavu, Tissue, Silk sarees and more.',
  url: 'https://minukki.in',
  image: 'https://minukki.in/images/logo.jpg',
  twitterHandle: '@minukkisarees',
};

export function generateSchema(type, data = {}) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: data.name || defaultSEO.siteName,
    url: data.url || defaultSEO.url,
    image: data.image || defaultSEO.image,
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseSchema,
        logo: defaultSEO.image,
        sameAs: [
          'https://www.facebook.com/minukkisarees',
          'https://www.instagram.com/minukkisarees',
          'https://www.youtube.com/minukkisarees',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          telephone: '+91-XXXXXXXXXX',
          email: 'support@minukkisarees.com',
        },
      };

    case 'Product':
      return {
        ...baseSchema,
        '@type': 'Product',
        description: data.description || '',
        price: data.price || 0,
        priceCurrency: 'INR',
        image: data.image || [],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating || 4.5,
          reviewCount: data.reviewCount || 0,
        },
        availability: 'https://schema.org/InStock',
      };

    case 'BreadcrumbList':
      return {
        ...baseSchema,
        '@type': 'BreadcrumbList',
        itemListElement: data.items || [],
      };

    case 'LocalBusiness':
      return {
        ...baseSchema,
        '@type': 'LocalBusiness',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
          addressLocality: data.city || 'Kerala',
          postalCode: data.postalCode || '',
        },
        telephone: data.phone || '',
      };

    default:
      return baseSchema;
  }
}

export function getBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: defaultSEO.url,
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      '@type': 'ListItem',
      position: index + 2,
      name: segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      item: `${defaultSEO.url}${currentPath}`,
    });
  });

  return breadcrumbs;
}
