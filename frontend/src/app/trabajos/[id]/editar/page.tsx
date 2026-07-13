'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchJobById, updateJob, JobPayload } from '@/api/jobs';
import Link from 'next/link';
import { useGeolocation } from '@/utils/useGeolocation';
import { supabase } from '@/utils/supabase';

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

export default function EditarTrabajoPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { location, error: geoError } = useGeolocation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<Partial<JobPayload>>({
    title: '',
    description: '',
    category: '',
    required_skills: [],
    budget: undefined,
    longitude: undefined,
    latitude: undefined,
    fotos_urls: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosError, setFotosError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push('/auth/login');
        return;
      }

      if (id) {
        const loadJob = async () => {
          try {
            const job = await fetchJobById(session.access_token, id);

            if (user && job.contractor_id !== user.id) {
              router.push(`/trabajos/${id}`);
              return;
            }

            setFormData({
              title: job.title,
              description: job.description,
              category: job.category,
              required_skills: job.required_skills || [],
              budget: job.budget || undefined,
              contractor_id: job.contractor_id,
              latitude: job.latitude || undefined,
              longitude: job.longitude || undefined,
              fotos_urls: job.fotos_urls || [],
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el trabajo');
          } finally {
            setLoading(false);
          }
        };
        loadJob();
      }
    }
  }, [authLoading, session, id, user, router]);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.required_skills?.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          required_skills: [...(prev.required_skills || []), skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills?.filter(s => s !== skillToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const archivosSeleccionados = Array.from(e.target.files);

    if (fotos.length + archivosSeleccionados.length > 10) {
      setFotosError('Solo puedes subir un máximo de 10 fotos por trabajo.');
      return;
    }

    setFotosError(null);
    setFotos(prev => [...prev, ...archivosSeleccionados]);

    // Limpiamos el input para poder subir la misma foto si se borró
    e.target.value = '';
  };

  const removeFotoExistente = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      fotos_urls: prev.fotos_urls?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const removeFoto = (indexToRemove: number) => {
    setFotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !user || !id) return;

    setSaving(true);
    setError(null);

    try {
      // 1. Empezamos con las fotos que ya existían y que el usuario NO borró de la vista previa
      let urlsFinales: string[] = [...(formData.fotos_urls || [])];

      // 2. Si el usuario agregó fotos NUEVAS, las subimos a Supabase Storage
      if (fotos.length > 0) {
        for (const foto of fotos) {
          const fileExt = foto.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('trabajos_imagenes')
            .upload(fileName, foto);

          if (uploadError) {
            throw new Error(`Error subiendo la foto nueva ${foto.name}: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('trabajos_imagenes')
            .getPublicUrl(fileName);

          // Agregamos la nueva URL al arreglo final
          urlsFinales.push(publicUrl);
        }
      }

      // 3. Armamos el paquete de datos actualizado
      const payload: JobPayload = {
        title: formData.title!,
        description: formData.description!,
        category: formData.category!,
        required_skills: formData.required_skills,
        estado: false,
        budget: formData.budget,
        contractor_id: user.id,
        latitude: location?.latitude,
        longitude: location?.longitude,
        fotos_urls: urlsFinales, // <-- ¡Aquí van TODAS las fotos mezcladas (las viejas + las nuevas)!
      };

      // 4. Se lo mandamos a tu API de actualización (ej. updateJob)
      await updateJob(session.access_token, id, payload);

      router.push(`/trabajos/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el trabajo');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/trabajos/${id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Cancelar y volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">Editar Trabajo</h1>
            <p className="text-gray-500 text-sm mt-1">Actualiza la información de tu publicación.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Título del trabajo *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: Reparación de tubería en cocina"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción detallada *</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Explica detalladamente qué necesitas hacer..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Presupuesto Estimado ($)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej: 50"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Habilidades requeridas (Opcional)</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej: Soldadura, PVC... (Presiona Enter)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.required_skills?.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sección de Fotos del Trabajo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Fotos del problema o requerimiento (Máx. 10 en total)
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Sube imágenes para que los profesionales entiendan mejor qué necesitas. La primera será la portada.
              </p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
              />

              {fotosError && (
                <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1">
                  <span>⚠️</span> {fotosError}
                </p>
              )}

              {/* Carrusel de previsualización de imágenes (Combinado) */}
              {(formData.fotos_urls && formData.fotos_urls.length > 0 || fotos.length > 0) && (
                <div className="mt-4 flex gap-3 overflow-x-auto pt-4 pb-2 custom-scrollbar">

                  {/* 1. FOTOS YA GUARDADAS EN LA BASE DE DATOS */}
                  {formData.fotos_urls?.map((url, index) => (
                    <div key={`existente-${index}`} className="relative group shrink-0">
                      <img
                        src={url}
                        alt={`guardada-${index}`}
                        className={`w-26 h-26 object-cover rounded-xl border-2 ${index === 0 ? 'border-blue-500' : 'border-gray-200'} shadow-sm`}
                      />
                      {/* Etiqueta de Portada */}
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Portada
                        </span>
                      )}
                      {/* Botón de eliminar foto guardada */}
                      <button
                        type="button"
                        onClick={() => removeFotoExistente(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 cursor-pointer"
                        title="Eliminar foto guardada"
                      >
                        <svg className="w-3 h-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* 2. FOTOS NUEVAS (POR SUBIR) */}
                  {fotos.map((foto, index) => {
                    // Si el usuario borró todas las fotos existentes, la primera foto nueva pasa a ser la portada
                    const isPortada = formData.fotos_urls?.length === 0 && index === 0;

                    return (
                      <div key={`${foto.name}-${index}`} className="relative group shrink-0">
                        <img
                          src={URL.createObjectURL(foto)}
                          alt={`preview-${index}`}
                          className={`w-26 h-26 object-cover rounded-xl border-2 ${isPortada ? 'border-blue-500' : 'border-gray-300 border-dashed'} shadow-sm opacity-95`}
                        />

                        {isPortada ? (
                          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            Portada
                          </span>
                        ) : (
                          <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            Nueva
                          </span>
                        )}

                        {/* Botón de eliminar foto nueva */}
                        <button
                          type="button"
                          onClick={() => removeFoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 cursor-pointer"
                          title="Eliminar foto nueva"
                        >
                          <svg className="w-3 h-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando Cambios...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
