"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  fetchContrataciones,
  updateEstadoContratacion,
  EstadoContratacion,
  Contratacion,
  uploadDocumentoContrato,
} from "@/api/contrataciones";
import {
  fetchPostulaciones,
  Postulacion,
} from "@/api/postulaciones";
import { createChat } from "@/api/chats";
import Link from "next/link";

export default function DashboardContratacionesPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"pendientes" | "activos" | "historial">(
    "pendientes",
  );

  const loadData = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [cData, pData] = await Promise.all([
        fetchContrataciones(accessToken),
        fetchPostulaciones(accessToken),
      ]);
      setContrataciones(cData);
      setPostulaciones(pData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar datos",
      );
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push("/auth/login");
        return;
      }
      void Promise.resolve().then(loadData);
    }
  }, [authLoading, session, router, loadData]);

  const handleUpdateEstado = async (id: string, nuevo: EstadoContratacion) => {
    if (!session?.access_token) return;
    try {
      await updateEstadoContratacion(session.access_token, id, nuevo);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar estado");
    }
  };

  const handleSimulateUpload = async (id: string) => {
    // Simulación de carga de PDF
    const mockUrl =
      "https://supabase.storage/contratos/mock-signed-contract.pdf";
    if (!session?.access_token) return;
    try {
      await uploadDocumentoContrato(session.access_token, id, mockUrl);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Error al subir documento");
    }
  };

  const handleOpenChat = async (c: Contratacion) => {
    if (!session?.access_token || !user?.id) return;
    try {
      await createChat(session.access_token, {
        cliente_id: c.cliente_id,
        trabajador_id: c.servicio?.trabajador_id || "",
        job_id: c.job_id || c.id,
      });
      router.push("/mensajeria");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al abrir chat");
    }
  };

  const filteredContrataciones = contrataciones.filter((c) => {
    if (tab === "pendientes")
      return [
        EstadoContratacion.PENDIENTE_FIRMA,
        EstadoContratacion.SOLICITUD_PENDIENTE,
      ].includes(c.estado_contrato);
    if (tab === "activos")
      return [
        EstadoContratacion.ACEPTADO,
        EstadoContratacion.EN_PROGRESO,
      ].includes(c.estado_contrato);
    if (tab === "historial")
      return [
        EstadoContratacion.COMPLETADO,
        EstadoContratacion.CANCELADO,
      ].includes(c.estado_contrato);
    return true;
  });

  const postulacionesPendientes =
    tab === "pendientes"
      ? postulaciones.filter((p) => p.estado === "pendiente")
      : [];

  const hasPendientes =
    postulacionesPendientes.length > 0 || filteredContrataciones.length > 0;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
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
          <div className="text-sm font-semibold text-gray-600">
            Panel de Gestión
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Mis Contrataciones
          </h1>
          <p className="text-gray-500">
            Gestiona el progreso de tus servicios contratados o recibidos.
          </p>
        </header>

        <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto pb-px">
          <button
            onClick={() => setTab("pendientes")}
            className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${tab === "pendientes" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            Solicitudes y Pendientes
          </button>
          <button
            onClick={() => setTab("activos")}
            className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${tab === "activos" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            En Progreso
          </button>
          <button
            onClick={() => setTab("historial")}
            className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${tab === "historial" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            Historial Finalizado
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!hasPendientes && tab === "pendientes" ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">
              No hay solicitudes ni contrataciones pendientes.
            </p>
          </div>
        ) : tab !== "pendientes" && filteredContrataciones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">
              No hay contrataciones en esta sección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Postulaciones pendientes (solo en tab pendientes) */}
            {postulacionesPendientes.map((p) => (
              <div
                key={`post-${p.id}`}
                className="bg-white rounded-2xl border border-amber-200 border-l-4 border-l-amber-400 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                        {p.trabajador_id === user?.id ? "Postulación enviada" : "Solicitud pendiente"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {p.trabajo?.title || "Trabajo"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <p>📅 {new Date(p.created_at).toLocaleDateString()}</p>
                      {p.trabajo?.budget ? (
                        <p>💰 <span className="font-bold text-gray-900">${p.trabajo.budget}</span></p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {p.trabajador_id === user?.id
                          ? p.trabajo?.perfiles?.nombre_completo?.charAt(0)
                          : p.trabajador?.nombre_completo?.charAt(0)}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        {p.trabajador_id === user?.id
                          ? `Contratante: ${p.trabajo?.perfiles?.nombre_completo || "Desconocido"}`
                          : `Trabajador: ${p.trabajador?.nombre_completo || "Desconocido"}`}
                      </p>
                    </div>
                    {p.trabajador_id !== user?.id && p.mensaje && (
                      <p className="mt-2 text-sm text-gray-500 italic line-clamp-2">
                        "{p.mensaje}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-37.5">
                    {p.trabajador_id !== user?.id ? (
                      <>
                        <button
                          onClick={async () => {
                            if (!session?.access_token) return;
                            try {
                              const { updateEstadoPostulacion } = await import("@/api/postulaciones");
                              await updateEstadoPostulacion(session.access_token, p.id, "aceptado");
                              loadData();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Error al aceptar");
                            }
                          }}
                          className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={async () => {
                            if (!session?.access_token) return;
                            try {
                              const { updateEstadoPostulacion } = await import("@/api/postulaciones");
                              await updateEstadoPostulacion(session.access_token, p.id, "rechazado");
                              loadData();
                            } catch (err) {
                              alert(err instanceof Error ? err.message : "Error al rechazar");
                            }
                          }}
                          className="w-full py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">
                        Esperando respuesta del contratante
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Contrataciones */}
            {filteredContrataciones.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${c.estado_contrato ===
                          EstadoContratacion.SOLICITUD_PENDIENTE
                          ? "bg-amber-100 text-amber-700"
                          : c.estado_contrato ===
                            EstadoContratacion.PENDIENTE_FIRMA
                            ? "bg-purple-100 text-purple-700"
                            : c.estado_contrato ===
                              EstadoContratacion.ACEPTADO
                              ? "bg-blue-100 text-blue-700"
                              : c.estado_contrato ===
                                EstadoContratacion.EN_PROGRESO
                                ? "bg-green-100 text-green-700"
                                : c.estado_contrato ===
                                  EstadoContratacion.COMPLETADO
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                      >
                        {c.estado_contrato.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-400">
                        ID: {c.id.split("-")[0]}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {c.trabajo?.title || c.servicio?.oficio || "Servicio Personalizado"}
                    </h3>
                    {c.trabajo?.title && c.servicio?.oficio && c.trabajo.title !== c.servicio.oficio && (
                      <p className="text-xs text-gray-400 mb-1">
                        Servicio: {c.servicio.oficio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <p>📅 {new Date(c.fecha_calendario).toLocaleString()}</p>
                      <p>
                        💰{" "}
                        <span className="font-bold text-gray-900">
                          ${c.precio_final}
                        </span>
                      </p>
                    </div>
                    {c.trabajo?.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {c.trabajo.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {c.cliente_id === user?.id
                          ? c.servicio?.trabajador?.nombre_completo?.charAt(0)
                          : c.cliente?.nombre_completo?.charAt(0)}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        {c.cliente_id === user?.id
                          ? `Trabajador: ${c.servicio?.trabajador?.nombre_completo}`
                          : `Cliente: ${c.cliente?.nombre_completo}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-37.5">
                    {/* Acciones como trabajador de la contratación */}
                    {c.servicio?.trabajador_id === user?.id &&
                      c.estado_contrato ===
                      EstadoContratacion.SOLICITUD_PENDIENTE && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateEstado(
                                c.id,
                                EstadoContratacion.ACEPTADO,
                              )
                            }
                            className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                          >
                            Aceptar Chamba
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateEstado(
                                c.id,
                                EstadoContratacion.CANCELADO,
                              )
                            }
                            className="w-full py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    {c.servicio?.trabajador_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.ACEPTADO && (
                        <button
                          onClick={() =>
                            handleUpdateEstado(
                              c.id,
                              EstadoContratacion.EN_PROGRESO,
                            )
                          }
                          className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700"
                        >
                          Iniciar Trabajo
                        </button>
                      )}
                    {c.servicio?.trabajador_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.EN_PROGRESO && (
                        <button
                          onClick={() =>
                            handleUpdateEstado(
                              c.id,
                              EstadoContratacion.COMPLETADO,
                            )
                          }
                          className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700"
                        >
                          Marcar como Terminado
                        </button>
                      )}

                    {/* Chat para cualquier participante en estados activos o pendientes */}
                    {(c.estado_contrato === EstadoContratacion.SOLICITUD_PENDIENTE ||
                      c.estado_contrato === EstadoContratacion.ACEPTADO ||
                      c.estado_contrato === EstadoContratacion.EN_PROGRESO) && (
                        <button
                          onClick={() => handleOpenChat(c)}
                          className="w-full py-2 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-200"
                        >
                          💬 Abrir Chat
                        </button>
                      )}

                    {/* Acciones como cliente de la contratación */}
                    {c.cliente_id === user?.id &&
                      c.estado_contrato ===
                      EstadoContratacion.PENDIENTE_FIRMA && (
                        <button
                          onClick={() => handleSimulateUpload(c.id)}
                          className="w-full py-2 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600"
                        >
                          Firmar Contrato (Simular)
                        </button>
                      )}
                    {c.cliente_id === user?.id &&
                      (c.estado_contrato === EstadoContratacion.SOLICITUD_PENDIENTE ||
                        c.estado_contrato === EstadoContratacion.PENDIENTE_FIRMA ||
                        c.estado_contrato === EstadoContratacion.ACEPTADO ||
                        c.estado_contrato === EstadoContratacion.EN_PROGRESO) && (
                        <button
                          onClick={() => {
                            if (c.estado_contrato === EstadoContratacion.ACEPTADO || c.estado_contrato === EstadoContratacion.EN_PROGRESO) {
                              const conf = confirm("¿Estás seguro de que deseas cancelar este trabajo en progreso? Se notificará al trabajador.");
                              if (!conf) return;
                            }
                            handleUpdateEstado(c.id, EstadoContratacion.CANCELADO);
                          }}
                          className="w-full py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50"
                        >
                          Cancelar Trabajo
                        </button>
                      )}
                    {c.cliente_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.EN_PROGRESO && (
                        <button
                          onClick={() =>
                            handleUpdateEstado(
                              c.id,
                              EstadoContratacion.COMPLETADO,
                            )
                          }
                          className="w-full py-2 border border-blue-200 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50"
                        >
                          Validar Finalización
                        </button>
                      )}

                    {c.documento_contrato_url && (
                      <a
                        href={c.documento_contrato_url}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline text-center block mt-2"
                      >
                        Ver Contrato 📄
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
