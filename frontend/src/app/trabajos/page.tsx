'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { fetchJobs, Job, JobFilter } from '@/api/jobs';
import Link from 'next/link';
import { useGeolocation } from '@/utils/useGeolocation';
import { getFromCache, setInCache, buildCacheKey } from '@/utils/cache';
import { getCategoryImage } from '@/app/lib/categoryImages';
import { getFavoriteJobs, toggleFavoriteJob } from '@/utils/favorites';

const CATEGORIES = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Limpieza',
  'Pintura',
  'Mecánica',
  'Jardinería',
  'Otros'
];

export default function TrabajosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <TrabajosContent />
    </Suspense>
  );
}

function TrabajosContent() {
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const { location, formatDistance, loading: geoLoading, denied } = useGeolocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState<JobFilter>({
    category: '',
    radius: 0
  });
  const cacheKey = buildCacheKey('trabajos', filters as Record<string, unknown>);
  const cached = getFromCache<Job[]>(cacheKey);
  const [jobs, setJobs] = useState<Job[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [favoriteJobs, setFavoriteJobs] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteJobs(getFavoriteJobs());
  }, []);

  const [activeCategory, setActiveCategory] = useState('Todo');

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = activeCategory === 'Todo' ||
      (activeCategory === 'Favoritos' ? favoriteJobs.includes(job.id) : job.category === activeCategory);
    const matchesFilterCategory = !filters.category ||
      (filters.category === 'Favoritos' ? favoriteJobs.includes(job.id) : true);
    return matchesCategory && matchesFilterCategory;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'trabajos' | 'servicios'>('trabajos');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const name = user?.user_metadata?.nombre_completo || user?.user_metadata?.username || 'Usuario';
  const initial = (user?.user_metadata?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase();

  // Sync URL search params on mount
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const radius = Number(searchParams.get('radius')) || 0;
    setFilters({ category, radius });
  }, []);

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.radius) params.set('radius', filters.radius.toString());
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [filters, pathname, router]);

  const refreshJobs = () => {
    setLoading(true);
    setError(null);
    setRefreshKey(k => k + 1);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    let cancelled = false;

    const fetchData = async (useGps: boolean) => {
      if (cancelled) return;
      try {
        const result = await fetchJobs(session.access_token, {
          category: (filters.category && filters.category !== 'Favoritos') ? filters.category : undefined,
          latitude: useGps ? location?.latitude : undefined,
          longitude: useGps ? location?.longitude : undefined,
          radius: filters.radius
        });
        if (cancelled) return;
        setJobs(result.data);
        setError(null);
        if (!useGps) setInCache(cacheKey, result.data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar los trabajos');
      } finally {
        if (cancelled) return;
        setLoading(false);
        setLoadingJobs(false);
      }
    };

    // 1. Fetch inmediato sin GPS
    setLoading(true);
    fetchData(false);

    // 2. Si GPS ya está disponible, re-fetch con GPS
    if (location && !geoLoading) {
      fetchData(true);
    }

    return () => { cancelled = true; };
  }, [authLoading, router, session, filters, location, geoLoading, refreshKey]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">

          <Link href="/" className="shrink-0">
            <img src="/images/logo-azul.png" alt="ChambaSegura" className="h-9 w-auto" />
          </Link>

          {/* Barra de Búsqueda */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Buscar ${viewMode === 'trabajos' ? 'trabajos' : 'servicios'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent text-gray-900 rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-sm placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* 👇 NUEVO PERFIL CON MENÚ DESPLEGABLE 👇 */}
          <div className="relative flex items-center shrink-0">

            {/* Botón que abre/cierra el menú */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200 focus:outline-none"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-sm font-black border border-blue-200 shadow-sm">
                {initial}
              </div>
              <span className="hidden sm:block text-sm font-bold text-gray-700">
                {name.split(' ')[0]}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-in-out ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Capa invisible para detectar el clic fuera del menú y cerrarlo */}
            <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 ease-out ${isProfileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              onClick={() => setIsProfileMenuOpen(false)}
            />

            {/* Contenedor del Menú con animación fluida de entrada y salida */}
            <div
              className={`absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-50 flex flex-col origin-top-right transition-all duration-300 ease-out ${isProfileMenuOpen
                ? 'opacity-100 scale-100 translate-y-0 visible'
                : 'opacity-0 scale-95 -translate-y-4 invisible pointer-events-none'
                }`}
            >

              {/* Encabezado del Perfil */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <p className="font-black text-gray-900">{name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Opciones del menu */}
              <div className="p-2 flex flex-col gap-0.5">

                <Link href="/trabajos" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-50 transition-colors group">
                  <div className="w-10 h-10 bg-blue-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💼</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Trabajos</span>
                    <span className="text-[10px] text-gray-500 font-medium">Explora trabajos, postúlate y publica</span>
                  </div>
                </Link>

                <Link href="/servicios" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cyan-50 transition-colors group">
                  <div className="w-10 h-10 bg-cyan-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔍</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Servicios</span>
                    <span className="text-[10px] text-gray-500 font-medium">Busca y ofrece servicios profesionales</span>
                  </div>
                </Link>

                <Link href="/mensajeria" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-purple-50 transition-colors group">
                  <div className="w-10 h-10 bg-purple-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💬</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Mensajería</span>
                    <span className="text-[10px] text-gray-500 font-medium">Conversa con clientes y trabajadores</span>
                  </div>
                </Link>

                <Link href="/dashboard/contrataciones" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-orange-50 transition-colors group">
                  <div className="w-10 h-10 bg-orange-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📄</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Contrataciones</span>
                    <span className="text-[10px] text-gray-500 font-medium">Gestiona solicitudes y contratos</span>
                  </div>
                </Link>

                <Link href="/perfil" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50 transition-colors group">
                  <div className="w-10 h-10 bg-emerald-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👤</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Mi Perfil</span>
                    <span className="text-[10px] text-gray-500 font-medium">Edita tu información personal</span>
                  </div>
                </Link>
              </div>

              {/* Sección Inferior: Salir y Publicar */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">

                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full px-2 text-red-500 hover:text-red-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Cerrar Sesión
                </button>

                {/* Botones de Publicar Trabajo o Servicio (Color Verde) */}
                <div className="flex gap-2">
                  <Link
                    href="/trabajos/nuevo"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs transition-transform hover:scale-105 shadow-md shadow-green-500/20"
                  >
                    <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    TRABAJO
                  </Link>
                  <Link
                    href="/servicios/nuevo"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-transform hover:scale-105 shadow-md shadow-emerald-600/20"
                  >
                    <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    SERVICIO
                  </Link>
                </div>

              </div>
            </div>

          </div>
          {/* 👆 FIN DEL NUEVO PERFIL 👆 */}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 sm:text-4xl">
              Trabajos Disponibles
            </h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Explora oportunidades validadas cerca de ti o publica una nueva necesidad en minutos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/trabajos/nuevo"
              className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm cursor-pointer active:scale-98 shadow-blue-500/10"
            >
              Publicar Trabajo
            </Link>
          </div>
        </div>

        {/* Panel de Filtros */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 mb-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Categoría
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="" className="text-gray-500">Todas las categorías</option>
                  <option value="Favoritos" className="text-red-600 font-bold">❤️ Mis Favoritos</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Distancia Máxima
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                  value={filters.radius || 0}
                  onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                >
                  <option value={0}>Todas las distancias</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={25000}>25 km</option>
                  <option value={50000}>50 km</option>
                  <option value={100000}>100 km</option>
                  <option value={500000}>500 km</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listado Principal con estados asíncronos */}
        {loadingJobs ? (
          /* Skeleton Loader Optimizado en Proporciones */
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
                <div className="flex justify-between items-center pt-1">
                  <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                  <div className="h-4 bg-gray-200 rounded-full w-8" />
                </div>
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                <div className="h-4 bg-gray-200 rounded-full w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State Rediseñado y Limpio */
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto my-4 shadow-xs">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-900 font-semibold text-lg">No hay resultados disponibles</p>
            <p className="text-gray-500 text-sm mt-1">No se encontraron trabajos en esta categoría en este momento.</p>
            <button
              onClick={() => setActiveCategory('Todo')}
              className="mt-5 inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          /* Grid de Trabajos Premium */
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/trabajos/${job.id}`} className="group block cursor-pointer">

                {/* Contenedor de Imagen / Ícono con Efectos visuales */}
                <div className="relative aspect-square mb-3.5 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/60 shadow-xs">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />

                  {/* Imagen real (Foto del usuario o Categoría por defecto) */}
                  {(job as any).fotos_urls && (job as any).fotos_urls.length > 0 ? (
                    <img
                      src={(job as any).fotos_urls[0]}
                      alt={`Foto de ${job.title}`}
                      // Agregamos absolute, inset-0 y object-cover para un llenado perfecto a prueba de balas
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={getCategoryImage(job.category)}
                      alt={job.category}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Botón Favorito */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      type="button"
                      className={`w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        favoriteJobs.includes(job.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setFavoriteJobs(toggleFavoriteJob(job.id));
                      }}
                    >
                      <svg
                        className="w-4 h-4 transition-colors duration-200"
                        fill={favoriteJobs.includes(job.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={favoriteJobs.includes(job.id) ? "0" : "2"}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  {/* Etiqueta flotante de Categoría (Opcional, si quieres que se vea encima de la foto) */}
                  <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                    <span className="text-[10px] font-black text-gray-700 tracking-wider uppercase">
                      {job.category}
                    </span>
                  </div>
                </div>

                {/* Información del Trabajo */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-gray-900 leading-snug truncate flex-1" title={job.title}>
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 text-sm font-semibold text-gray-900">
                      <span>⭐</span>
                      <span className="text-sm font-medium">
                        {job.perfiles?.rating_promedio !== null && job.perfiles?.rating_promedio !== undefined
                          ? Number(job.perfiles.rating_promedio).toFixed(1)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                    {job.category}
                  </p>

                  {/* Estado de Ubicación e Indicadores con mejor feedback */}
                  {job.distancia_metros !== undefined && job.distancia_metros !== null ? (
                    <p className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                      <span>📍</span> A {formatDistance(job.distancia_metros)}
                    </p>
                  ) : job.ubicacion ? (
                    <p className={`text-sm font-medium ${geoLoading ? 'text-blue-500 animate-pulse' : location ? 'text-blue-400' : denied ? 'text-amber-600' : 'text-gray-400'}`}>
                      {geoLoading ? 'Calculando distancia...' : location ? 'Cargando distancia...' : denied ? 'Activa tu ubicación para medir distancia' : 'Ubicación no disponible'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Sin ubicación especificada</p>
                  )}

                  {/* Precio / Presupuesto resaltado */}
                  <p className="text-[15px] font-extrabold text-gray-900 pt-1">
                    ${job.budget || 0} USD
                  </p>
                </div>

              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}