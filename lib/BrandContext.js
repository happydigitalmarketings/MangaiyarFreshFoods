import { createContext } from 'react';

const BrandContext = createContext({
  siteName: 'Mangaiyar Fresh Foods',
  primaryColor: '#8B4513',
  primaryColorDark: '#703810',
  logo: '/images/logo.png',
  slug: null,
});

export default BrandContext;
