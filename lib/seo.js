// SEO utilities for meta tags and structured data

export const defaultSEO = {
  siteName: 'Priyam Supermarket',
  description: 'Shop fresh groceries, vegetables, fruits, dairy, and household essentials. Fast delivery, quality guaranteed.',
  url: 'https://priyamsupermarket.com',
  image: 'https://priyamsupermarket.com/images/logo.png',
  twitterHandle: '@priyamsupermarket',
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
          'https://www.facebook.com/priyamsupermarket',
          'https://www.instagram.com/priyamsupermarket',
          'https://www.youtube.com/priyamsupermarket',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          telephone: '+91-93845-01766',
          email: 'support@priyamsupermarket.com',
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
