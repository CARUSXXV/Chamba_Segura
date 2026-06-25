const categoryImages: Record<string, string> = {
  'Plomería': '/images/categories/plomeria.jpg',
  'Electricidad': '/images/categories/electricidad.jpg',
  'Carpintería': '/images/categories/carpinteria.jpg',
  'Limpieza': '/images/categories/limpieza.jpg',
  'Pintura': '/images/categories/pintura.jpg',
  'Mecánica': '/images/categories/mecanica.jpg',
  'Jardinería': '/images/categories/jardineria.jpg',
  'Otros': '/images/categories/otros.jpg',
};

export function getCategoryImage(category: string): string {
  return categoryImages[category] || '/images/categories/otros.jpg';
}
