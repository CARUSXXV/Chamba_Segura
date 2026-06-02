'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchJobById, deleteJob, Job } from '@/api/jobs';
import ConfirmModal from '@/app/components/ConfirmModal';
import Link from 'next/link';

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
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

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
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el trabajo');
          } finally {
            setLoading(false);
          }
        };
        loadJob();
      }
    }
  }, [authLoading, session, id, router]);

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
  const isTrabajador = user?.user_metadata?.es_trabajador;

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
                  <p className="text-sm font-bold text-gray-900">{job.perfiles?.nombre_completo || 'Usuario desconocido'}</p>
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
              ) : isTrabajador ? (
                <button
                  className="w-full flex justify-center items-center py-4 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  onClick={() => setInfoMsg('Próximamente podrás postularte a este trabajo.')}
                >
                  Postularme a este trabajo
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </main>

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

      <ConfirmModal
        isOpen={!!infoMsg}
        title="Información"
        message={infoMsg || ''}
        confirmLabel="Entendido"
        variant="default"
        onConfirm={() => setInfoMsg(null)}
        onCancel={() => setInfoMsg(null)}
      />
    </div>
  );
}
