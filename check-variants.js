const http = require('http');

http.get('http://localhost:3000/api/products?limit=20', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      const apple = products.find(p => p.title.toLowerCase().includes('apple'));
      if (apple) {
        console.log('Apple Product:');
        console.log('Title:', apple.title);
        console.log('Weight Variants:', JSON.stringify(apple.weightVariants, null, 2));
        console.log('Number of variants:', apple.weightVariants ? apple.weightVariants.length : 0);
      } else {
        console.log('No apple product found');
        console.log('Available products:', products.map(p => p.title));
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
