import '../styles/globals.css';
import Header from '../components/Header';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import CartSidebar from '../components/CartSidebar';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BrandContext from '../lib/BrandContext';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  const [brand, setBrand] = useState({
    siteName: 'Mangaiyar Fresh Foods',
    primaryColor: '#8B4513',
    primaryColorDark: '#703810',
    logo: '/images/logo.png',
    slug: null,
  });

  useEffect(() => {
    async function loadBrand() {
      try {
        // detect domain
        let domain = null;
        if (typeof window !== 'undefined' && window.location && window.location.hostname) {
          domain = window.location.hostname;
        }
        const qs = domain ? `?domain=${encodeURIComponent(domain)}` : '';
        const res = await fetch(`/api/branding${qs}`);
        if (res.ok) {
          const data = await res.json();
          setBrand(data);
          if (data.primaryColor) document.documentElement.style.setProperty('--primary-color', data.primaryColor);
          if (data.primaryColorDark) document.documentElement.style.setProperty('--primary-color-dark', data.primaryColorDark);
        }
      } catch (e) {
        // ignore
      }
    }
    loadBrand();
  }, []);

  return (
    <BrandContext.Provider value={brand}>
      {!isAdminPage && <Header />}
      {!isAdminPage && <FloatingWhatsApp />}
      {!isAdminPage && <CartSidebar />}
      <Component {...pageProps} />
    </BrandContext.Provider>
  );
}
