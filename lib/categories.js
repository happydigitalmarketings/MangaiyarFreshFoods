// Central list of categories used across the app
// name: display name, slug: url-friendly slug
export const CATEGORIES = [
  { name: 'Kasavu Sarees', slug: 'kasavu-sarees' },
  { name: 'Set Sarees', slug: 'set-sarees' },
  { name: 'Tissue Sarees', slug: 'tissue-sarees' },
  { name: 'Handloom Sarees', slug: 'handloom-sarees' },
  { name: 'Designer Sarees', slug: 'designer-sarees' },
  { name: 'Silk Kasavu Sarees', slug: 'silk-kasavu-sarees' },
  // removed: Traditional, Wedding, Festival
];

export function nameFromSlug(slug) {
  const found = CATEGORIES.find(c => c.slug === slug);
  return found ? found.name : null;
}

export function slugFromName(name) {
  const found = CATEGORIES.find(c => c.name === name);
  return found ? found.slug : null;
}
