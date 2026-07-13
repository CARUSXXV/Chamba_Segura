'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createJob, JobPayload } from '@/api/jobs';
import Link from 'next/link';
import { useGeolocation } from '@/utils/useGeolocation';
import { supabase } from '@/utils/supabase'; // <-- Ajusta la ruta a tu archivo de configuración de Supabase



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

export default function NuevoTrabajoPage() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { location, error: geoError } = useGeolocation();
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<JobPayload>>({
    title: '',
    description: '',
    category: '',
    required_skills: [],
    budget: undefined,
    fotos_urls: [],
    contractor_id: user?.id || '',
    latitude: location?.latitude || undefined,
    longitude: location?.longitude || undefined,
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosError, setFotosError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      }
    }
  }, [user, authLoading, router]);

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

  const removeFoto = (indexToRemove: number) => {
    setFotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Array temporal para guardar los links públicos
      let urlsSubidas: string[] = [];

      // 2. Si el usuario seleccionó fotos, las subimos a Supabase Storage primero
      if (fotos.length > 0) {
        for (const foto of fotos) {
          // Generamos un nombre único para que no choquen si se llaman igual (ej: "foto.png")
          const fileExt = foto.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          // Subimos el archivo fisicamente al bucket
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('trabajos_imagenes')
            .upload(fileName, foto);

          if (uploadError) {
            throw new Error(`Error subiendo la foto ${foto.name}: ${uploadError.message}`);
          }

          // Sacamos el Link público de la foto recién subida
          const { data: { publicUrl } } = supabase.storage
            .from('trabajos_imagenes')
            .getPublicUrl(fileName);

          urlsSubidas.push(publicUrl);
        }
      }

      // 3. Armamos el paquete de datos con todo + los links de las fotos
      const payload: JobPayload = {
        title: formData.title!,
        description: formData.description!,
        category: formData.category!,
        required_skills: formData.required_skills,
        budget: formData.budget,
        contractor_id: user.id,
        latitude: location?.latitude,
        longitude: location?.longitude,
        fotos_urls: urlsSubidas, // <-- ¡Aquí van los links hacia tu API de NestJS!
        estado: false,
      };

      // 4. Se lo mandamos a tu backend como siempre
      const newJob = await createJob(session.access_token, payload);
      router.push(`/trabajos/${newJob.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el trabajo');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-2xl mx-auto">

        {/* Enlace de regreso */}
        <Link
          href="/trabajos"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-800 mb-8 transition-colors group cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2 transform transition-transform group-hover:-translate-x-0.5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a trabajos
        </Link>

        {/* Contenedor del Formulario */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">

          {/* Encabezado */}
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Publicar Nuevo Trabajo</h1>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              Describe claramente el requerimiento para que los profesionales calificados puedan postularse.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Alertas de Estado */}
            {error && (
              <div className="bg-red-50/70 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2.5">
                <span className="text-base select-none mt-0.5">⚠️</span>
                <div>
                  <span className="font-bold">Error al guardar:</span> {error}
                </div>
              </div>
            )}

            {geoError && (
              <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-2.5">
                <span className="text-base select-none mt-0.5">📍</span>
                <div>
                  <span className="font-bold">Aviso de ubicación:</span> {geoError}. Tu solicitud se listará con alcance general sin una posición geográfica exacta.
                </div>
              </div>
            )}

            {location && (
              <div className="bg-emerald-50/60 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex justify-between items-center gap-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-base select-none mt-0.5">✨</span>
                  <span>
                    <span className="font-bold">Ubicación vinculada:</span> El trabajo se geolocalizará de forma automática para conectar de inmediato con profesionales de tu zona.
                  </span>
                </div>
                <svg className="w-5 h-5 text-emerald-600 shrink-0 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {/* Título del Trabajo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Título del requerimiento *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder:text-gray-400"
                placeholder="Ej: Reparación urgente de tubería principal en cocina"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Descripción detallada *</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder:text-gray-400 resize-none leading-relaxed"
                placeholder="Especifica claramente el problema, materiales disponibles, urgencia y cualquier detalle técnico relevante para el profesional..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Fila Doble: Categoría y Presupuesto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Selector de Categorías */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Categoría *</label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="" className="text-gray-400">Selecciona el rubro</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Presupuesto Estimado ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 font-semibold text-sm pointer-events-none select-none">
                    $
                  </span>
                  <input
                    type="number"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Opcional (Ej: 45)"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>
            </div>

            {/* Sección de Habilidades (Tags) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Habilidades requeridas (Opcional)
              </label>
              <p className="text-xs text-gray-400 mb-2.5">
                Escribe un término y presiona <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-sans font-semibold">Enter</kbd> para fijarlo como requisito.
              </p>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm placeholder:text-gray-400"
                placeholder="Ej: Soldadura de estaño, Termofusión, PVC..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />

              {/* Contenedor Flex Wrap de Skills */}
              {formData.required_skills && formData.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
                  {formData.required_skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-all hover:bg-blue-100/70"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="p-0.5 rounded-md hover:bg-blue-200 hover:text-blue-900 transition-colors cursor-pointer"
                        title={`Eliminar ${skill}`}
                      >
                        <svg className="w-3 h-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sección de Fotos del Trabajo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Fotos del problema o requerimiento (Máx. 10)
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

              {/* Carrusel de previsualización de imágenes */}
              {fotos.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pt-4 pb-2 custom-scrollbar">
                  {fotos.map((foto, index) => (
                    <div key={`${foto.name}-${index}`} className="relative group shrink-0">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`preview-${index}`}
                        className={`w-26 h-26 object-cover rounded-xl border-2 ${index === 0 ? 'border-blue-500' : 'border-gray-200'} shadow-sm`}
                      />
                      {/* Etiqueta de "Portada" para la primera foto */}
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Portada
                        </span>
                      )}
                      {/* Botón de eliminar foto */}
                      <button
                        type="button"
                        onClick={() => removeFoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 cursor-pointer"
                        title="Eliminar foto"
                      >
                        <svg className="w-3 h-3 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón de Envío */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 shadow-blue-500/10"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publicando orden...</span>
                  </div>
                ) : (
                  'Publicar Trabajo'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}