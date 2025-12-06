import { createContext } from 'react';

const BrandContext = createContext({
  siteName: 'Minukki Sarees',
  primaryColor: '#8B4513',
  primaryColorDark: '#703810',
  logo: '/images/logo.jpg',
  slug: null,
});

export default BrandContext;
