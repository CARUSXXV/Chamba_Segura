"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  fetchContrataciones,
  updateEstadoContratacion,
  EstadoContratacion,
  Contratacion,
  uploadDocumentoContrato,
} from "@/api/contrataciones";
import EstrellasUsuario from "@/app/components/EstrellasUsuarios";

import { fetchPostulaciones, Postulacion } from "@/api/postulaciones";
import { createChat } from "@/api/chats";
import { createResena } from "@/api/resenas";
import Link from "next/link";

function DashboardContratacionesContent() {
  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(searchParams.get('pago') === 'exitoso');

  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"pendientes" | "activos" | "historial">(
    "pendientes",
  );
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [contratacionToRate, setContratacionToRate] = useState<Contratacion | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [comentario, setComentario] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

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

  const handleOpenRating = (c: Contratacion) => {
    setContratacionToRate(c);
    setRatingVal(5);
    setComentario("");
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!session?.access_token || !contratacionToRate) return;
    setSubmittingRating(true);
    try {
      // Sacamos el ID del trabajador
      const trabajadorId = contratacionToRate.servicio?.trabajador_id || contratacionToRate.servicio?.trabajador?.id;

      await createResena(session.access_token, {
        contrataciones_id: contratacionToRate.id,
        evaluado_id: trabajadorId || "", // ¡Ahora sí el evaluado es el trabajador!
        evaluador_id: user?.id || "",
        calificacion: ratingVal,
        comentario: comentario.trim() || undefined,
      });
      setRatingModalOpen(false);
      setContratacionToRate(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al enviar reseña");
    } finally {
      setSubmittingRating(false);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all"
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
                  strokeWidth="2.5"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-black text-blue-600 tracking-tighter">
              ChambaSegura
            </span>
          </div>
          <div className="hidden sm:block text-sm font-bold text-gray-400 uppercase tracking-widest">
            Gestión
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Mis Contrataciones
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Gestiona el progreso de tus servicios contratados o recibidos.
          </p>
        </header>

        <div className="flex gap-8 border-b border-gray-100 mb-12 overflow-x-auto pb-px scrollbar-hide">
          <button
            onClick={() => setTab("pendientes")}
            className={`pb-4 px-1 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${tab === "pendientes" ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setTab("activos")}
            className={`pb-4 px-1 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${tab === "activos" ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            En Progreso
          </button>
          <button
            onClick={() => setTab("historial")}
            className={`pb-4 px-1 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${tab === "historial" ? "border-blue-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            Historial
          </button>
        </div>

        {showSuccess && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span>Pago exitoso — el monto está retenido en garantía. El trabajador ya puede comenzar.</span>
            <button onClick={() => setShowSuccess(false)} className="ml-auto text-green-500 hover:text-green-700 font-bold">✕</button>
          </div>
        )}

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
                className="bg-white rounded-airbnb border border-gray-100 p-8 shadow-sm hover:shadow-airbnb transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                        {p.trabajador_id === user?.id ? "Postulación enviada" : "Solicitud pendiente"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {p.trabajo?.title || "Trabajo"}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                      <p className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                      {p.trabajo?.budget ? (
                        <p className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <span className="font-bold text-gray-900">${p.trabajo.budget}</span>
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {/* Avatar Dinámico */}
                      <div className="w-12 h-12 flex-shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg font-bold text-blue-600 border border-gray-100">
                        {p.trabajador_id === user?.id
                          ? p.trabajo?.perfiles?.nombre_completo?.charAt(0) || "U"
                          : p.trabajador?.nombre_completo?.charAt(0) || "U"}
                      </div>

                      {/* Nombre Clickeable y Estrellas */}
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-900">
                          {p.trabajador_id === user?.id ? (
                            <>
                              Contratante:{" "}
                              <Link
                                href={`/perfil/${p.trabajo?.perfiles?.id || ""}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {p.trabajo?.perfiles?.nombre_completo || "Desconocido"}
                              </Link>
                            </>
                          ) : (
                            <>
                              Trabajador:{" "}
                              <Link
                                href={`/perfil/${p.trabajador_id}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {p.trabajador?.nombre_completo || "Desconocido"}
                              </Link>
                            </>
                          )}
                        </p>

                        <div className="mt-1">
                          <EstrellasUsuario
                            usuarioId={p.trabajador_id === user?.id ? (p.trabajo?.perfiles?.id || "") : p.trabajador_id}
                            token={session?.access_token || ""}
                          />
                        </div>
                      </div>
                    </div>
                    {p.trabajador_id !== user?.id && p.mensaje && (
                      <p className="mt-4 text-sm text-gray-500 italic leading-relaxed">
                        &quot;{p.mensaje}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-48">
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
                          className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
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
                          className="w-full py-3 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="animate-pulse flex justify-center mb-2">
                           <div className="w-2 h-2 bg-amber-400 rounded-full mx-0.5" />
                           <div className="w-2 h-2 bg-amber-400 rounded-full mx-0.5" />
                           <div className="w-2 h-2 bg-amber-400 rounded-full mx-0.5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                          Enviada
                        </p>
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
                className="bg-white rounded-airbnb border border-gray-100 p-8 shadow-sm hover:shadow-airbnb transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.estado_contrato ===
                          EstadoContratacion.SOLICITUD_PENDIENTE
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : c.estado_contrato ===
                            EstadoContratacion.PENDIENTE_FIRMA
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : c.estado_contrato ===
                              EstadoContratacion.ACEPTADO
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : c.estado_contrato ===
                                EstadoContratacion.EN_PROGRESO
                                ? "bg-green-50 text-green-600 border-green-100"
                                : c.estado_contrato ===
                                  EstadoContratacion.COMPLETADO
                                  ? "bg-gray-50 text-gray-600 border-gray-100"
                                  : "bg-red-50 text-red-600 border-red-100"
                          }`}
                      >
                        {c.estado_contrato.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        ID: {c.id.split("-")[0]}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {c.trabajo?.title || c.servicio?.oficio || "Servicio Personalizado"}
                    </h3>
                    {c.trabajo?.title && c.servicio?.oficio && c.trabajo.title !== c.servicio.oficio && (
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        CATEGORÍA: {c.servicio.oficio.toUpperCase()}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                      <p className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        {new Date(c.fecha_calendario).toLocaleString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <span className="font-bold text-gray-900">
                          ${c.precio_final}
                        </span>
                      </p>
                    </div>
                    {c.trabajo?.description && (
                      <p className="mt-4 text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {c.trabajo.description}
                      </p>
                    )}
                    <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {/* Avatar Dinámico */}
                      <div className="w-12 h-12 flex-shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg font-bold text-blue-600 border border-gray-100">
                        {c.cliente_id === user?.id
                          ? c.servicio?.trabajador?.nombre_completo?.charAt(0) || "U"
                          : c.cliente?.nombre_completo?.charAt(0) || "U"}
                      </div>

                      {/* Nombre Clickeable y Estrellas */}
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-900">
                          {c.cliente_id === user?.id ? (
                            <>
                              Trabajador:{" "}
                              <Link
                                href={`/perfil/${c.servicio?.trabajador_id || c.servicio?.trabajador?.id || ""}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {c.servicio?.trabajador?.nombre_completo || "Desconocido"}
                              </Link>
                            </>
                          ) : (
                            <>
                              Cliente:{" "}
                              <Link
                                href={`/perfil/${c.cliente_id}`}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {c.cliente?.nombre_completo || "Desconocido"}
                              </Link>
                            </>
                          )}
                        </p>

                        <div className="mt-1">
                          <EstrellasUsuario
                            usuarioId={c.cliente_id === user?.id ? (c.servicio?.trabajador_id || c.servicio?.trabajador?.id || "") : c.cliente_id}
                            token={session?.access_token || ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-48">
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
                            className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
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
                            className="w-full py-3 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    {c.servicio?.trabajador_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.ACEPTADO && (
                        <div className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-xl text-center">
                          ⌛ Esperando pago del cliente
                        </div>
                      )}
                    {c.servicio?.trabajador_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.EN_PROGRESO && (
                        <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider rounded-xl text-center">
                          🛠️ Trabajo en progreso
                        </div>
                      )}

                    {/* Chat para cualquier participante en estados activos o pendientes */}
                    {(c.estado_contrato === EstadoContratacion.SOLICITUD_PENDIENTE ||
                      c.estado_contrato === EstadoContratacion.ACEPTADO ||
                      c.estado_contrato === EstadoContratacion.EN_PROGRESO) && (
                        <button
                          onClick={() => handleOpenChat(c)}
                          className="w-full py-3 bg-gray-100 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
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
                          className="w-full py-3 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
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
                          className="w-full py-3 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Cancelar Trabajo
                        </button>
                      )}
                    {c.cliente_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.ACEPTADO && (
                        <Link
                          href={`/pago?contratacion_id=${c.id}`}
                          className="w-full py-3 bg-green-600 text-white text-center text-sm font-bold rounded-xl hover:bg-green-700 transition-colors block"
                        >
                          Pagar Ahora — ${c.precio_final}
                        </Link>
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
                          className="w-full py-3 border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors"
                        >
                          Validar Finalización
                        </button>
                      )}

                    {c.cliente_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.COMPLETADO &&
                      (!c.resenas || c.resenas.length === 0) && (
                        <button
                          onClick={() => handleOpenRating(c)}
                          className="w-full py-3 bg-yellow-400 text-white text-sm font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-sm"
                        >
                          ⭐ Calificar Trabajador
                        </button>
                      )}

                    {c.cliente_id === user?.id &&
                      c.estado_contrato === EstadoContratacion.COMPLETADO &&
                      c.resenas && c.resenas.length > 0 && (
                        <div className="w-full py-3 bg-gray-50 border border-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl text-center">
                          Reseña enviada: {c.resenas[0].calificacion} ⭐
                        </div>
                      )}

                    {c.documento_contrato_url && (
                      <a
                        href={c.documento_contrato_url}
                        target="_blank"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors text-center block mt-2"
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

      {/* Modal de Calificación */}
      {ratingModalOpen && contratacionToRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Calificar Trabajo</h3>
            <p className="text-gray-500 text-sm mb-6">
              ¿Cómo evaluarías el trabajo de {contratacionToRate.servicio?.trabajador?.nombre_completo || 'este trabajador'}?
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${ratingVal >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario (opcional)..."
              className=" w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 text-sm mb-6 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRatingModalOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                disabled={submittingRating}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={submittingRating}
              >
                {submittingRating ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardContratacionesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <DashboardContratacionesContent />
    </Suspense>
  );
}
