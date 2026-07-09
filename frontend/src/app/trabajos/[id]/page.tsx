'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchJobById, deleteJob, Job } from '@/api/jobs';
import { createPostulacion, fetchPostulacionesByJob, updateEstadoPostulacion, Postulacion } from '@/api/postulaciones';
import ConfirmModal from '@/app/components/ConfirmModal';
import EstrellasUsuario from '@/app/components/EstrellasUsuarios';
import Link from 'next/link';
import { parseUbicacion, buildMapSrcDoc } from '@/utils/mapUtils';

export default function DetalleTrabajoPage() {

  const { user, session, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);
  const [showPostularModal, setShowPostularModal] = useState(false);
  const [mensajePostulacion, setMensajePostulacion] = useState('');
  const [postulando, setPostulando] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [fotoPrincipal, setFotoPrincipal] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push('/auth/login');
        return;
      }

      if (id) {
        const loadJob = async () => {
          try {
            const data = await fetchJobById(session.access_token, id);
            setJob(data);

            if (user?.id === data.contractor_id) {
              setLoadingPostulaciones(true);
              try {
                const p = await fetchPostulacionesByJob(session.access_token, id);
                setPostulaciones(p);
              } catch {
                /* silent */
              } finally {
                setLoadingPostulaciones(false);
              }
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el trabajo');
          } finally {
            setLoading(false);
          }
        };
        loadJob();
      }
    }
  }, [authLoading, session, id, router, user]);

  useEffect(() => {
    if ((job as any)?.fotos_urls && (job as any).fotos_urls.length > 0) {
      setFotoPrincipal((job as any).fotos_urls[0]);
    }
  }, [job]);

  const handleDelete = async () => {
    if (!session?.access_token || !id) return;

    setIsDeleting(true);
    try {
      await deleteJob(session.access_token, id);
      setShowDeleteModal(false);
      router.push('/trabajos');
    } catch (err) {
      setInfoMsg(err instanceof Error ? err.message : 'Error al eliminar el trabajo');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEstadoPostulacion = async (postulacionId: string, nuevoEstado: 'aceptado' | 'rechazado') => {
    if (!session?.access_token) return;
    try {
      await updateEstadoPostulacion(session.access_token, postulacionId, nuevoEstado);
      const updated = postulaciones.map(p =>
        p.id === postulacionId ? { ...p, estado: nuevoEstado } : p
      );
      setPostulaciones(updated);
    } catch (err) {
      setInfoMsg(err instanceof Error ? err.message : 'Error al gestionar postulación');
    }
  };

  const handlePostular = async () => {
    if (!session?.access_token || !id) return;
    setPostulando(true);
    try {
      await createPostulacion(session.access_token, {
        job_id: id,
        mensaje: mensajePostulacion.trim() || undefined,
      });
      setShowPostularModal(false);
      setMensajePostulacion('');
      setInfoMsg('Te postulaste exitosamente. El contratante revisará tu solicitud.');
    } catch (err) {
      setInfoMsg(err instanceof Error ? err.message : 'Error al postularte');
    } finally {
      setPostulando(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ups, algo salió mal</h1>
          <p className="text-gray-500 mb-6">{error || 'El trabajo no existe.'}</p>
          <Link href="/trabajos" className="text-blue-600 font-semibold hover:underline">
            Volver a la lista de trabajos
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === job.contractor_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/trabajos" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-black text-blue-600 tracking-tighter">ChambaSegura</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                {job.category}
              </span>
              <span className="text-gray-400 text-sm">
                Publicado el {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{job.title}</h1>

            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl mb-8 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {job.perfiles?.nombre_completo?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-tight">Contratante</p>
                  <Link href={`/perfil/${job.contractor_id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    {job.perfiles?.nombre_completo || 'Usuario desconocido'}
                  </Link>
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-tight">Presupuesto</p>
                <p className="text-sm font-bold text-green-600">{job.budget ? `$${job.budget}` : 'Por definir'}</p>
              </div>
            </div>

            <div className="prose prose-blue max-w-none mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción del trabajo</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {job.required_skills && job.required_skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Habilidades requeridas</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.ubicacion && (() => {
              const coords = parseUbicacion(job.ubicacion);
              if (!coords) return null;
              return (
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span>📍</span> Ubicación aproximada
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Por privacidad, mostramos solo el área general del trabajo, no la dirección exacta.
                  </p>
                  <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                    <iframe
                      className="h-full w-full border-none"
                      srcDoc={buildMapSrcDoc(coords.lat, coords.lng)}
                      title="Mapa de ubicación aproximada"
                    />
                  </div>
                </div>
              );
            })()}

            {/* SECCIÓN DE GALERÍA DE FOTOS */}
            {(job as any)?.fotos_urls && (job as any).fotos_urls.length > 0 && (
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
                {(job as any).fotos_urls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {(job as any).fotos_urls.map((url: string, index: number) => (
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

            <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
              {isOwner ? (
                <>
                  <Link
                    href={`/trabajos/${job.id}/editar`}
                    className="flex-1 min-w-35 flex justify-center items-center py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Editar Trabajo
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                    className="flex-1 min-w-35 flex justify-center items-center py-3 px-6 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </>
              ) : (
                <button
                  className="w-full flex justify-center items-center py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  onClick={() => setShowPostularModal(true)}
                >
                  Postularme a este trabajo
                </button>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Postulaciones ({postulaciones.length})
            </h2>
            {loadingPostulaciones ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
                Cargando postulaciones...
              </div>
            ) : postulaciones.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-400">Aún no hay postulaciones para este trabajo.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {postulaciones.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {p.trabajador?.nombre_completo?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/perfil/${p.trabajador_id}`}
                            className="font-bold text-blue-600 hover:text-blue-800 transition-colors truncate block"
                          >
                            {p.trabajador?.nombre_completo || 'Trabajador'}
                          </Link>
                          <div className="mt-0.5">
                            <EstrellasUsuario
                              usuarioId={p.trabajador_id}
                              token={session?.access_token || ""}
                            />
                          </div>
                          {p.mensaje && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.mensaje}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(p.created_at).toLocaleDateString()} - {new Date(p.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.estado === 'pendiente' ? (
                          <>
                            <button
                              onClick={() => handleEstadoPostulacion(p.id, 'aceptado')}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleEstadoPostulacion(p.id, 'rechazado')}
                              className="px-4 py-2 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50"
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.estado === 'aceptado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {p.estado === 'aceptado' ? 'Aceptado' : 'Rechazado'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showPostularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Postularme a este trabajo
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Cuéntale al contratante por qué eres la persona ideal para este trabajo.
              </p>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm text-gray-900"
                rows={4}
                placeholder="Escribe un mensaje (opcional)..."
                value={mensajePostulacion}
                onChange={(e) => setMensajePostulacion(e.target.value)}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPostularModal(false);
                    setMensajePostulacion('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePostular}
                  disabled={postulando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {postulando ? 'Postulando...' : 'Enviar Postulación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar trabajo"
        message="¿Estás seguro de que deseas eliminar este trabajo? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {infoMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${infoMsg.includes('exitosamente') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
              {infoMsg.includes('exitosamente') ? '✓' : '✕'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {infoMsg.includes('exitosamente') ? '¡Postulación Enviada!' : 'Error'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">{infoMsg}</p>
            <button
              onClick={() => setInfoMsg(null)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}