'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchJobs, Job, JobFilter } from '@/api/jobs';
import Link from 'next/link';

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
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilter>({
    category: '',
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [fetchId, setFetchId] = useState(0);

  const refreshJobs = () => {
    setLoading(true);
    setError(null);
    setFetchId(id => id + 1);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const data = await fetchJobs(session.access_token, {
          category: filters.category || undefined,
          skills: filters.skills?.length ? filters.skills : undefined
        });
        if (!cancelled) setJobs(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar los trabajos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, [authLoading, router, session, filters, fetchId]);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!filters.skills?.includes(skillInput.trim())) {
        setFilters(prev => ({
          ...prev,
          skills: [...(prev.skills || []), skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skillToRemove)
    }));
  };

  const isTrabajador = user?.user_metadata?.es_trabajador;

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Trabajos Disponibles</h1>
            <p className="text-gray-500">Explora oportunidades o publica una nueva necesidad.</p>
          </div>
          {isTrabajador ? (
            <Link
              href="/servicios/nuevo"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
            >
              Publicar Servicio
            </Link>
          ) : (
            <Link 
              href="/trabajos/nuevo"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
            >
              Publicar Trabajo
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="" className="text-gray-500">Todas las categorías</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Habilidades (Enter para agregar)</label>
              <input 
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: Tuberías, Cableado..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {filters.skills?.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
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
              onClick={refreshJobs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No hay trabajos publicados aún</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">Prueba ajustando tus filtros o publica un nuevo requerimiento.</p>
            {!isTrabajador && (
              <Link 
                href="/trabajos/nuevo"
                className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700"
              >
                Publica el primer trabajo &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <Link 
                key={job.id} 
                href={`/trabajos/${job.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                    {job.category}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {job.budget ? `$${job.budget}` : 'Por definir'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                  {job.description}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                    {job.perfiles?.nombre_completo?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {job.perfiles?.nombre_completo || 'Usuario desconocido'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
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
