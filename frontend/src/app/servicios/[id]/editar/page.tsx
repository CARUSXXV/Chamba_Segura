'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchServicioById, updateServicio, ServicioPayload } from '@/api/servicios';
import Link from 'next/link';
import { useGeolocation } from '@/utils/useGeolocation';
import { supabase } from '@/utils/supabase';

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

export default function EditarServicioPage() {
    const { user, session, isLoading: authLoading } = useAuth();
    const { location, error: geoError } = useGeolocation();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [formData, setFormData] = useState<Partial<ServicioPayload>>({
        oficio: '',
        tipo_de_oficio: '',
        descripcion: '',
        tarifa_promedio: 0,
        firma_contrato: false,
        latitude: undefined,
        longitude: undefined,
        fotos_urls: [], // Restaurado con "s"
    });
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
                const loadServicio = async () => {
                    try {
                        const servicio = await fetchServicioById(session.access_token, id);

                        if (user && servicio.trabajador_id !== user.id) {
                            router.push(`/servicios/${id}`);
                            return;
                        }

                        setFormData({
                            oficio: servicio.oficio,
                            tipo_de_oficio: servicio.tipo_de_oficio,
                            descripcion: servicio.descripcion,
                            tarifa_promedio: servicio.tarifa_promedio,
                            firma_contrato: servicio.firma_contrato,
                            latitude: servicio.ubicacion?.coordinates?.[1] || undefined,
                            longitude: servicio.ubicacion?.coordinates?.[0] || undefined,
                            fotos_urls: servicio.fotos_urls || [], // Restaurado con "s"
                        });
                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'Error al cargar el servicio');
                    } finally {
                        setLoading(false);
                    }
                };
                loadServicio();
            }
        }
    }, [authLoading, session, id, user, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const archivosSeleccionados = Array.from(e.target.files);

        if (fotos.length + archivosSeleccionados.length > 10) {
            setFotosError('Solo puedes subir un máximo de 10 fotos por servicio.');
            return;
        }

        setFotosError(null);
        setFotos(prev => [...prev, ...archivosSeleccionados]);
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
            let urlsFinales: string[] = [...(formData.fotos_urls || [])];

            if (fotos.length > 0) {
                for (const foto of fotos) {
                    const fileExt = foto.name.split('.').pop();
                    const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                    // NOTA: Si usas un bucket distinto para servicios, cambia 'trabajos_imagenes' por el correcto
                    const { error: uploadError } = await supabase.storage
                        .from('trabajos_imagenes')
                        .upload(fileName, foto);

                    if (uploadError) {
                        throw new Error(`Error subiendo la foto nueva ${foto.name}: ${uploadError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('trabajos_imagenes')
                        .getPublicUrl(fileName);

                    urlsFinales.push(publicUrl);
                }
            }

            const payload: ServicioPayload = {
                trabajador_id: user.id,
                oficio: formData.oficio!,
                tipo_de_oficio: formData.tipo_de_oficio || undefined,
                descripcion: formData.descripcion!,
                tarifa_promedio: formData.tarifa_promedio!,
                firma_contrato: formData.firma_contrato || false,
                latitude: location?.latitude,
                longitude: location?.longitude,
                fotos_urls: urlsFinales, // Restaurado con "s"
            };

            await updateServicio(session.access_token, id, payload);
            router.push(`/servicios/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar el servicio');
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
                    href={`/servicios/${id}`}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Cancelar y volver
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                        <h1 className="text-2xl font-bold text-gray-900">Editar Servicio</h1>
                        <p className="text-gray-500 text-sm mt-1">Actualiza la información y detalles de tu publicación.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* FILA 1: Oficio y Tarifa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Oficio Principal *</label>
                                <select
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    value={formData.oficio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, oficio: e.target.value }))}
                                >
                                    <option value="">Selecciona tu oficio principal</option>
                                    {OFICIOS.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tarifa Base Promedio ($) *</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ej: 50"
                                    value={formData.tarifa_promedio || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tarifa_promedio: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        {/* FILA 2: Especialidad y Firma de Contrato */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Especialidad (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ej: Tuberías de alta presión..."
                                    value={formData.tipo_de_oficio || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_de_oficio: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 opacity-0 select-none hidden md:block">Espaciador</label>
                                <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 h-[46px] rounded-xl select-none transition-colors hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        id="firma_contrato"
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={formData.firma_contrato}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firma_contrato: e.target.checked }))}
                                    />
                                    <label htmlFor="firma_contrato" className="text-sm font-semibold text-gray-700 cursor-pointer select-none w-full">
                                        Exigir firma de contrato
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* FILA 3: Descripción */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción detallada del servicio *</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder="Explica detalladamente las labores que realizas y tu experiencia..."
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            />
                        </div>

                        {/* Sección de Fotos */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Fotos de trabajos anteriores (Máx. 10 en total)
                            </label>
                            <p className="text-xs text-gray-400 mb-3">
                                Sube imágenes para mostrar la calidad de tu trabajo. La primera será la portada de tu servicio.
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

                            {((formData.fotos_urls && formData.fotos_urls.length > 0) || fotos.length > 0) && (
                                <div className="mt-4 flex gap-3 overflow-x-auto pt-4 pb-2 custom-scrollbar">

                                    {formData.fotos_urls?.map((url, index) => (
                                        <div key={`existente-${index}`} className="relative group shrink-0">
                                            <img
                                                src={url}
                                                alt={`guardada-${index}`}
                                                className={`w-26 h-26 object-cover rounded-xl border-2 ${index === 0 ? 'border-blue-500' : 'border-gray-200'} shadow-sm`}
                                            />
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                                    Portada
                                                </span>
                                            )}
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

                                    {fotos.map((foto, index) => {
                                        const isPortada = (!formData.fotos_urls || formData.fotos_urls.length === 0) && index === 0;

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