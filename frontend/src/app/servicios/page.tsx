"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { fetchServicios, Servicio, ServicioFilter } from "@/api/servicios";
import Link from "next/link";
import { useGeolocation } from "@/utils/useGeolocation";
import { getFromCache, setInCache, buildCacheKey } from "@/utils/cache";

const OFICIOS = [
  "Plomería",
  "Electricidad",
  "Carpintería",
  "Limpieza",
  "Pintura",
  "Mecánica",
  "Jardinería",
  "Reparaciones",
  "Mudanzas",
  "Otros",
];

export default function ServiciosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <ServiciosContent />
    </Suspense>
  );
}

function ServiciosContent() {
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const { location, formatDistance, loading: geoLoading, denied } = useGeolocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState<ServicioFilter>({
    radius: 0,
    oficio: "",
  });
  const cacheKey = buildCacheKey("servicios", filters as Record<string, unknown>);
  const cached = getFromCache<Servicio[]>(cacheKey);
  const [servicios, setServicios] = useState<Servicio[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  // Sync URL search params on mount
  useEffect(() => {
    const oficio = searchParams.get("oficio") || "";
    const radius = Number(searchParams.get("radius")) || 0;
    setFilters({ oficio, radius });
  }, []);

  // Update URL search params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.oficio) params.set("oficio", filters.oficio);
    if (filters.radius) params.set("radius", filters.radius.toString());
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [filters, pathname, router]);

  // Efecto principal: fetch inmediato (sin GPS) + re-fetch cuando GPS resuelva
  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push("/auth/login");
      return;
    }

    let cancelled = false;

    const fetchData = async (useGps: boolean) => {
      if (cancelled) return;
      try {
        const data = await fetchServicios(session.access_token, {
          latitude: useGps ? location?.latitude : undefined,
          longitude: useGps ? location?.longitude : undefined,
          radius: filters.radius,
          oficio: filters.oficio || undefined,
        });
        if (cancelled) return;
        setServicios(data);
        setError(null);
        if (!useGps) setInCache(cacheKey, data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error al cargar servicios");
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
  }, [authLoading, router, session, filters, location, geoLoading]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 backdrop-blur-xs">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar Minimalista (Preservada exactamente) */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-black text-blue-600 tracking-tighter">
              ChambaSegura
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 truncate max-w-[150px] sm:max-w-[200px]">
              {user?.user_metadata?.nombre_completo || user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-95"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Header de la Sección */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 sm:text-4xl">
              Servicios Disponibles
            </h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Encuentra servicios profesionales calificados u ofrece los tuyos a la comunidad.
            </p>
          </div>
          <Link
            href="/servicios/nuevo"
            className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shrink-0 cursor-pointer active:scale-98 shadow-blue-500/10"
          >
            Publicar Servicio
          </Link>
        </div>

        {/* Panel de Filtros Modernizado */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 mb-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Categoría / Oficio
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                  value={filters.oficio}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      oficio: e.target.value,
                    }))
                  }
                >
                  <option value="" className="text-gray-500">Todos los oficios</option>
                  {OFICIOS.map((o) => (
                    <option key={o} value={o} className="text-gray-900">
                      {o}
                    </option>
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
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      radius: Number(e.target.value),
                    }))
                  }
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

        {/* Listado con Estados de Carga, Error o Vacío */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse space-y-4"
              >
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
                  <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50/60 border border-red-200/60 text-red-700 p-8 rounded-2xl text-center max-w-lg mx-auto">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="font-bold text-base text-gray-900 mb-2">Error de comunicación</p>
            <p className="text-sm text-red-600/90 mb-5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm shadow-red-600/10"
            >
              Reintentar
            </button>
          </div>
        ) : servicios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto shadow-2xs">
            <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
              📭
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              No hay servicios disponibles
            </h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              Los prestadores de servicios aún no han realizado publicaciones. Regresa más tarde.
            </p>
          </div>
        ) : (
          /* Grid Principal de Servicios */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <Link
                key={s.id}
                href={`/servicios/${s.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md hover:border-blue-400/60 transition-all duration-200 cursor-pointer relative"
              >
                {/* Categoría y Tarifa Promedio */}
                <div className="flex justify-between items-center gap-4 mb-4 select-none">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-wider border border-blue-100/50">
                    {s.oficio}
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 shrink-0">
                    ${s.tarifa_promedio}
                  </span>
                </div>

                {/* Geolocalización Dinámica */}
                {s.distancia_metros !== undefined && s.distancia_metros !== null ? (
                  <p className="text-blue-600 text-xs font-bold mb-3 flex items-center gap-1 shrink-0">
                    <svg className="w-3.5 h-3.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    A {formatDistance(s.distancia_metros)}
                  </p>
                ) : s.ubicacion ? (
                  <p className={`text-xs font-bold mb-3 flex items-center gap-1 shrink-0 ${geoLoading ? 'text-blue-500 animate-pulse' : location ? 'text-blue-400' : denied ? 'text-amber-600' : 'text-gray-400'}`}>
                    <svg className={`w-3.5 h-3.5 stroke-2 ${geoLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {geoLoading ? 'Calculando distancia...' : location ? 'Cargando distancia...' : denied ? 'Activa tu ubicación para medir' : 'Ubicación no disponible'}
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs font-semibold mb-3 flex items-center gap-1 shrink-0">
                    <span>🌐</span> Cobertura nacional / Sin ubicación
                  </p>
                )}

                {/* Tipo de Oficio Secundario (Si aplica) */}
                {s.tipo_de_oficio && (
                  <div className="mb-3.5 shrink-0 max-w-full">
                    <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-md border border-gray-100 truncate">
                      {s.tipo_de_oficio}
                    </span>
                  </div>
                )}

                {/* Descripción con Contención Estricta */}
                <p className="text-gray-500 text-sm line-clamp-2 mb-5 flex-1 leading-relaxed">
                  {s.descripcion}
                </p>

                {/* Footer del Profesional / Firma Contrato */}
                <div className="flex items-center gap-3 pt-3.5 border-t border-gray-100 mt-auto">
                  <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-xs font-extrabold text-blue-600 uppercase select-none shrink-0">
                    {s.perfiles?.nombre_completo?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {s.perfiles?.nombre_completo || "Usuario desconocido"}
                    </p>
                  </div>
                  
                  {/* Badge de Requisito de Contrato */}
                  {s.firma_contrato && (
                    <span 
                      className="text-xs bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 cursor-help shrink-0 select-none" 
                      title="Requiere firma de contrato formal"
                    >
                      📜 Contrato
                    </span>
                  )}

                  {/* Flecha interactiva */}
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