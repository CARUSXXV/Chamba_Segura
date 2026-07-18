"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchServicioById, Servicio } from "@/api/servicios";
import { createContratacion, EstadoContratacion } from "@/api/contrataciones";
import Link from "next/link";
import { parseUbicacion, buildMapSrcDoc } from "@/utils/mapUtils";

export default function DetalleServicioPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [fechaCalendario, setFechaCalendario] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fotoPrincipal, setFotoPrincipal] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push("/auth/login");
        return;
      }

      if (id) {
        const loadServicio = async () => {
          try {
            const data = await fetchServicioById(session.access_token, id);
            setServicio(data);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Error al cargar el servicio",
            );
          } finally {
            setLoading(false);
          }
        };
        loadServicio();
      }
    }
  }, [authLoading, session, id, router]);

  useEffect(() => {
    if ((servicio as any)?.fotos_urls && (servicio as any).fotos_urls.length > 0) {
      setFotoPrincipal((servicio as any).fotos_urls[0]);
    }
  }, [servicio]);

  const handleSolicitar = async () => {
    if (!session?.access_token || !id || !fechaCalendario) return;

    setIsRequesting(true);
    try {
      const res = await createContratacion(session.access_token, {
        servicios_id: id,
        fecha_calendario: new Date(fechaCalendario).toISOString(),
        precio_final: servicio!.tarifa_promedio,
      });

      setShowModal(false);
      if (res.estado_contrato === EstadoContratacion.PENDIENTE_FIRMA) {
        setSuccessMsg(
          "Solicitud enviada. Este servicio requiere firma de contrato. Por favor, revisa tu panel de contrataciones.",
        );
      } else {
        setSuccessMsg("Solicitud de contratación enviada con éxito.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al solicitar la contratación",
      );
      setIsRequesting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !servicio) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ups, algo salió mal
          </h1>
          <p className="text-gray-500 mb-6">
            {error || "El servicio no existe."}
          </p>
          <Link
            href="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === servicio.trabajador_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
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
            <img src="/images/logo-azul.png" alt="ChambaSegura" className="h-8 w-auto" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                {servicio.oficio}
              </span>
              {servicio.tipo_de_oficio && (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100 uppercase tracking-wider">
                  {servicio.tipo_de_oficio}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
              {servicio.oficio}
            </h1>

            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl mb-8 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {servicio.perfiles?.nombre_completo?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-tight">
                    Trabajador
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {servicio.perfiles?.nombre_completo ||
                      "Usuario desconocido"}
                  </p>
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-tight">
                  Tarifa Promedio
                </p>
                <p className="text-sm font-bold text-green-600">
                  ${servicio.tarifa_promedio}
                </p>
              </div>
            </div>

            <div className="prose prose-blue max-w-none mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Descripción
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {servicio.descripcion}
              </p>
            </div>

            {servicio.firma_contrato && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-8 flex gap-3">
                <span className="text-amber-600 text-xl">📜</span>
                <div>
                  <p className="text-amber-900 font-bold text-sm">
                    Requiere Contrato
                  </p>
                  <p className="text-amber-700 text-xs">
                    Este servicio requiere la firma de un acuerdo digital antes
                    de comenzar.
                  </p>
                </div>
              </div>
            )}

            {servicio.ubicacion && (() => {
              const coords = parseUbicacion(servicio.ubicacion);
              if (!coords) return null;
              return (
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span>📍</span> Zona de cobertura
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Por privacidad, mostramos solo el área general donde opera este profesional.
                  </p>
                  <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                    <iframe
                      className="h-full w-full border-none"
                      srcDoc={buildMapSrcDoc(coords.lat, coords.lng)}
                      title="Zona de cobertura del servicio"
                    />
                  </div>
                </div>
              );
            })()}

            {/* SECCIÓN DE GALERÍA DE FOTOS */}
            {(servicio as any)?.fotos_urls && (servicio as any).fotos_urls.length > 0 && (
              <div className="mt-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fotos del Requerimiento
                </h3>

                {/* Foto Principal en Grande */}
                <div className="w-full h-64 md:h-96 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center mb-4 relative group">
                  {fotoPrincipal ? (
                    <img
                      src={fotoPrincipal}
                      alt="Foto principal del trabajo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="animate-pulse w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Carrusel de Miniaturas (Solo se muestra si hay más de 1 foto) */}
                {(servicio as any).fotos_urls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {(servicio as any).fotos_urls.map((url: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setFotoPrincipal(url)}
                        className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${fotoPrincipal === url
                          ? 'border-blue-600 shadow-md ring-2 ring-blue-100 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                      >
                        <img
                          src={url}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-8 border-t border-gray-100">
              {!isOwner && (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full flex justify-center items-center py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Solicitar Contratación
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Solicitar Servicio
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Fecha y Hora Preferida
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    value={fechaCalendario}
                    onChange={(e) => setFechaCalendario(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-500">Tarifa propuesta:</span>
                    <span className="text-gray-900 font-bold">
                      ${servicio.tarifa_promedio}
                    </span>
                  </div>
                </div>
                {servicio.firma_contrato && (
                  <p className="text-xs text-amber-600 font-medium italic">
                    * Se te pedirá adjuntar el contrato firmado tras la
                    solicitud.
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSolicitar}
                  disabled={!fechaCalendario || isRequesting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRequesting ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¡Solicitud Enviada!
            </h3>
            <p className="text-gray-500 text-sm mb-6">{successMsg}</p>
            <button
              onClick={() => router.push("/dashboard/contrataciones")}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              Ir a Mis Contrataciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
