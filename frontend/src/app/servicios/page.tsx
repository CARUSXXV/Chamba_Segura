"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
            <span className="text-sm text-gray-600">
              {user?.user_metadata?.nombre_completo || user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
              Servicios Disponibles
            </h1>
            <p className="text-gray-500">
              Encuentra servicios profesionales u ofrece los tuyos.
            </p>
          </div>
          <Link
            href="/servicios/nuevo"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shrink-0"
          >
            Publicar Servicio
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría / Oficio
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={filters.oficio}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    oficio: e.target.value,
                  }))
                }
              >
                <option value="">Todos los oficios</option>
                {OFICIOS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distancia Máxima (km)
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-6" />
                <div className="h-8 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <p className="font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : servicios.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              No hay servicios disponibles aún
            </h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Los trabajadores aún no han publicado servicios. Vuelve más tarde.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((s) => (
              <Link
                key={s.id}
                href={`/servicios/${s.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                    {s.oficio}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    ${s.tarifa_promedio}
                  </span>
                </div>
                {s.distancia_metros !== undefined && s.distancia_metros !== null ? (
                  <p className="text-blue-600 text-xs font-semibold mb-2 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formatDistance(s.distancia_metros)}
                  </p>
                ) : s.ubicacion ? (
                  <p className={`text-xs font-semibold mb-2 flex items-center gap-1 ${geoLoading ? 'text-blue-500' : location ? 'text-blue-400' : denied ? 'text-amber-600' : 'text-gray-500'}`}>
                    <svg
                      className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {geoLoading ? 'Calculando distancia...' : location ? 'Cargando distancia...' : denied ? 'Activa tu ubicación' : 'Ubicación no disponible'}
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1">
                    <span>🌐</span> Cobertura nacional / Sin ubicación
                  </p>
                )}
                {s.tipo_de_oficio && (
                  <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100 mb-3">
                    {s.tipo_de_oficio}
                  </span>
                )}
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {s.descripcion}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    {s.perfiles?.nombre_completo?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {s.perfiles?.nombre_completo || "Usuario desconocido"}
                    </p>
                  </div>
                  {s.firma_contrato && (
                    <span className="text-xs text-amber-600" title="Requiere firma de contrato">
                      📜
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
