export function getFavoriteJobs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const favs = localStorage.getItem('favoritos_trabajos');
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    console.error('Error reading favorite jobs from localStorage:', e);
    return [];
  }
}

export function toggleFavoriteJob(id: string): string[] {
  const current = getFavoriteJobs();
  const index = current.indexOf(id);
  let updated: string[];
  if (index > -1) {
    updated = current.filter(item => item !== id);
  } else {
    updated = [...current, id];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('favoritos_trabajos', JSON.stringify(updated));
  }
  return updated;
}

export function getFavoriteServices(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const favs = localStorage.getItem('favoritos_servicios');
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    console.error('Error reading favorite services from localStorage:', e);
    return [];
  }
}

export function toggleFavoriteService(id: string): string[] {
  const current = getFavoriteServices();
  const index = current.indexOf(id);
  let updated: string[];
  if (index > -1) {
    updated = current.filter(item => item !== id);
  } else {
    updated = [...current, id];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('favoritos_servicios', JSON.stringify(updated));
  }
  return updated;
}
