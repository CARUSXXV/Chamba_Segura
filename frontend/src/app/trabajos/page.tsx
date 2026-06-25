'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { fetchJobs, Job, JobFilter } from '@/api/jobs';
import Link from 'next/link';
import { useGeolocation } from '@/utils/useGeolocation';
import { getFromCache, setInCache, buildCacheKey } from '@/utils/cache';

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
        const data = await fetchJobs(session.access_token, {
          category: filters.category || undefined,
          latitude: useGps ? location?.latitude : undefined,
          longitude: useGps ? location?.longitude : undefined,
          radius: filters.radius
        });
        if (cancelled) return;
        setJobs(data);
        setError(null);
        if (!useGps) setInCache(cacheKey, data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar los trabajos');
      } finally {
        if (cancelled) return;
        setLoading(false);
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
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-black text-blue-600 tracking-tighter">ChambaSegura</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.user_metadata?.nombre_completo || user?.email}</span>
            <button onClick={() => signOut()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all">Salir</button>
          </div>
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
              href="/servicios/nuevo"
              className="inline-flex items-center justify-center px-5 py-3 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              Ofrecer un Servicio
            </Link>
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
        {loading ? (
          /* Skeletons Refinados */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded-md w-1/4" />
                  <div className="h-5 bg-gray-200 rounded-md w-1/5" />
                </div>
                <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 rounded-md w-1/3" />
                <div className="space-y-2 pt-1">
                  <div className="h-3 bg-gray-100 rounded-md w-full" />
                  <div className="h-3 bg-gray-100 rounded-md w-5/6" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                    <div className="h-2 bg-gray-100 rounded-md w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Caja de Error Limpia */
          <div className="bg-red-50/60 border border-red-200/60 text-red-700 p-8 rounded-2xl text-center max-w-lg mx-auto">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="font-bold text-base text-gray-900 mb-2">Ocurrió un inconveniente</p>
            <p className="text-sm text-red-600/90 mb-5">{error}</p>
            <button 
              onClick={refreshJobs}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm shadow-red-600/10"
            >
              Reintentar carga
            </button>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State Estilo Airbnb */
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto shadow-2xs">
            <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
              📭
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">No hay trabajos publicados</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
              Prueba ajustando los filtros de búsqueda o sé el primero en abrir una vacante.
            </p>
            <Link 
              href="/trabajos/nuevo"
              className="inline-flex items-center gap-1.5 font-bold text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Publica el primer trabajo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          /* Grid de Tarjetas Optimizado */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <Link 
                key={job.id} 
                href={`/trabajos/${job.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md hover:border-blue-400/60 transition-all duration-200 cursor-pointer relative"
              >
                {/* Badge de Categoría e Indicador de Presupuesto */}
                <div className="flex justify-between items-center gap-4 mb-4 select-none">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-wider border border-blue-100/50">
                    {job.category}
                  </span>
                  <span className="text-base font-extrabold text-gray-900 shrink-0">
                    {job.budget ? `$${job.budget} USD` : 'Por definir'}
                  </span>
                </div>
                
                {/* Título Con Protección Estricta */}
                <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors truncate max-w-full" title={job.title}>
                  {job.title}
                </h3>
                
                {/* Lógica Completa de Estados de Ubicación y GPS */}
                {job.distancia_metros !== undefined && job.distancia_metros !== null ? (
                  <p className="text-blue-600 text-xs font-bold mb-3.5 flex items-center gap-1 shrink-0">
                    <svg className="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    A {formatDistance(job.distancia_metros)}
                  </p>
                ) : job.ubicacion ? (
                  <p className={`text-xs font-bold mb-3.5 flex items-center gap-1 shrink-0 ${geoLoading ? 'text-blue-500 animate-pulse' : location ? 'text-blue-400' : denied ? 'text-amber-600' : 'text-gray-400'}`}>
                    <svg className={`w-3.5 h-3.5 stroke-2 ${geoLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {geoLoading ? 'Calculando distancia...' : location ? 'Cargando distancia...' : denied ? 'Activa tu ubicación para medir' : 'Ubicación no disponible'}
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs font-semibold mb-3.5 flex items-center gap-1 shrink-0">
                    <span>🌐</span> Cobertura nacional / Sin ubicación
                  </p>
                )}
                
                {/* Descripción con límite de líneas controlado */}
                <p className="text-gray-500 text-sm line-clamp-2 mb-5 flex-1 leading-relaxed">
                  {job.description}
                </p>
                
                {/* Footer de la Tarjeta: Info del Creador */}
                <div className="flex items-center gap-3 pt-3.5 border-t border-gray-100 mt-auto">
                  <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-xs font-extrabold text-gray-500 uppercase select-none shrink-0">
                    {job.perfiles?.nombre_completo?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {job.perfiles?.nombre_completo || 'Usuario desconocido'}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
                      {new Date(job.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  
                  {/* Flecha interactiva sutil de la tarjeta */}
                  <div className="text-gray-300 group-hover:text-blue-500 transition-colors pl-1 shrink-0">
                    <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}