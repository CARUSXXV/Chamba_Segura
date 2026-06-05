"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchServicios, Servicio } from "@/api/servicios";
import Link from "next/link";

export default function ServiciosPage() {
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push("/auth/login");
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await fetchServicios(session.access_token);
        if (!cancelled) setServicios(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Error al cargar servicios",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, session]);

  const esTrabajador = user?.user_metadata?.es_trabajador === true;

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
              {esTrabajador
                ? "Ofrece tus servicios para que clientes te contraten."
                : "Encuentra al profesional ideal para tu próximo proyecto y solicita sus servicios."}
            </p>
          </div>
          {esTrabajador && (
            <Link
              href="/servicios/nuevo"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shrink-0"
            >
              Publicar Servicio
            </Link>
          )}
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
