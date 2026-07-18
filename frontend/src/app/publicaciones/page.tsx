'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getCategoryImage } from '@/app/lib/categoryImages'; // Para las imágenes por defecto
import { useRouter } from 'next/navigation';
import { fetchMyJobs, deleteJob } from '@/api/publicaciones/trabajos';
import { fetchMyServicios, deleteServicio } from '@/api/publicaciones/servicios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';


export default function MisPublicacionesPage() {
    const { session, user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // ESTADOS PARA DATOS REALES
    const [trabajos, setMyJobs] = useState<any[]>([]);
    const [servicios, setMyServicios] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);

    const [viewMode, setViewMode] = useState<'trabajos' | 'servicios'>('trabajos');

    // CARGAR LOS DATOS DESDE NESTJS (Filtrados por el backend para el usuario actual)
    useEffect(() => {
        if (!authLoading) {
            if (!session) {
                router.push('/auth/login');
                return;
            }

            async function loadMisPublicaciones() {
                if (!session?.access_token) return;

                setLoadingJobs(true);
                setLoadingServices(true);
                try {
                    const responseServicio = await fetchMyServicios(session.access_token);
                    const responseTrabajos = await fetchMyJobs(session.access_token);

                    // Si es un arreglo directo lo usamos, si viene dentro de .data también.
                    const trabajosData = Array.isArray(responseTrabajos) ? responseTrabajos : (responseTrabajos?.data || []);
                    const serviciosData = Array.isArray(responseServicio) ? responseServicio : (responseServicio?.data || []);

                    setMyJobs(trabajosData);
                    setMyServicios(serviciosData);
                } catch (error) {
                    console.error('Error cargando tus publicaciones:', error);
                } finally {
                    setLoadingJobs(false);
                    setLoadingServices(false);
                }
            }

            loadMisPublicaciones();
        }
    }, [session, user, authLoading]);

    // FUNCIÓN PARA ELIMINAR EN LA BASE DE DATOS
    const handleDelete = async (id: string) => {
        const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta publicación permanentemente?');
        if (!confirmar || !session?.access_token) return;

        try {
            if (viewMode === 'trabajos') {
                // Llamamos a la API de trabajos
                await deleteJob(session.access_token, id);

                // Si no lanza error, actualizamos la pantalla
                setMyJobs(prev => prev.filter(t => t.id !== id));
            } else {
                // Llamamos a la API de servicios
                await deleteServicio(session.access_token, id);

                // Si no lanza error, actualizamos la pantalla
                setMyServicios(prev => prev.filter(s => s.id !== id));
            }

            alert('Publicación eliminada correctamente.');

        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Hubo un error al intentar eliminar la publicación. Revisa tu conexión.');
        }
    };

    // Dependiendo de la pestaña, determinamos qué datos mostrar
    const currentData = viewMode === 'trabajos' ? trabajos : servicios;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* NAVEGACIÓN SUPERIOR */}
            <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver al Dashboard
                    </Link>

                    <Link
                        href={`/${viewMode === 'trabajos' ? 'trabajos' : 'servicios'}/nuevo`}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        <span className="hidden sm:inline">Nuevo {viewMode === 'trabajos' ? 'Trabajo' : 'Servicio'}</span>
                        <span className="sm:hidden">Nuevo</span>
                    </Link>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 md:py-10">

                {/* ENCABEZADO Y TOGGLE */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mis Publicaciones</h1>
                        <p className="text-gray-500 mt-1">Gestiona, edita o elimina las ofertas que has creado.</p>
                    </div>

                    <div className="relative grid grid-cols-2 bg-gray-200/60 p-1.5 rounded-2xl border border-gray-100 shrink-0 min-w-[280px] sm:min-w-[320px]">
                        <div className="absolute inset-0 p-1.5 pointer-events-none flex">
                            <div
                                className={`w-1/2 h-full bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${viewMode === 'trabajos' ? 'translate-x-0' : 'translate-x-full'
                                    }`}
                            />
                        </div>
                        <button
                            onClick={() => setViewMode('trabajos')}
                            className={`relative z-10 py-2.5 font-bold text-sm transition-colors duration-300 cursor-pointer ${viewMode === 'trabajos' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            💼 Trabajos ({trabajos.length})
                        </button>
                        <button
                            onClick={() => setViewMode('servicios')}
                            className={`relative z-10 py-2.5 font-bold text-sm transition-colors duration-300 cursor-pointer ${viewMode === 'servicios' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            🛠️ Servicios ({servicios.length})
                        </button>
                    </div>
                </header>

                {/* GRID DE PUBLICACIONES CRUD */}
                {viewMode === 'trabajos' && (
                    <section>
                        {loadingJobs ? (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse space-y-3">
                                        <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
                                        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                                        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : currentData.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center shadow-xs max-w-2xl mx-auto mt-10">
                                <div className="text-4xl mb-4 text-gray-300">📝</div>
                                <p className="text-gray-900 font-bold text-xl">Aún no tienes {viewMode} publicados</p>
                                <p className="text-gray-500 text-sm mt-2">Crea tu primera publicación para empezar a recibir ofertas de clientes o profesionales.</p>
                                <Link
                                    href={`/${viewMode === 'trabajos' ? 'trabajos' : 'servicios'}/nuevo`}
                                    className="inline-block mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                                >
                                    Crear {viewMode === 'trabajos' ? 'Trabajo' : 'Servicio'}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {currentData.map((item) => {
                                    // 1. Detectamos si es un trabajo o un servicio
                                    const isTrabajo = viewMode === 'trabajos';

                                    // 2. Mapeamos las variables correctas según el tipo
                                    const titulo = isTrabajo ? item.title : item.oficio;
                                    const categoria = isTrabajo ? item.category : item.tipo_de_oficio || 'Servicio';
                                    const precio = isTrabajo ? item.budget : item.tarifa_promedio;
                                    const fecha = isTrabajo ? item.created_at : item.actualizado_el;

                                    // Ojo aquí con fotos_urls vs fotos_url
                                    const fotosArray = isTrabajo ? item.fotos_urls : item.fotos_urls;
                                    const fotoPrincipal = fotosArray && fotosArray.length > 0
                                        ? fotosArray[0]
                                        : getCategoryImage(categoria);

                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                            {/* Foto y Badge de Estado */}
                                            <div className="relative h-44 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={fotoPrincipal}
                                                    alt={titulo}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                                <div className="absolute top-3 left-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border ${item.estado || item.status === 'Activo' ? 'bg-green-500 text-white border-green-600' : 'bg-amber-400 text-amber-900 border-amber-500'}`}>
                                                        Activo
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Información Principal */}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{categoria}</p>
                                                </div>
                                                <h3 className="font-bold text-gray-900 leading-snug line-clamp-2" title={titulo}>
                                                    {titulo}
                                                </h3>
                                                <div className="mt-auto pt-3">
                                                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                                                        Actualizado: {fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                                                    </p>
                                                    <p className="font-black text-gray-900 text-lg">${precio} <span className="text-xs text-gray-400">USD</span></p>
                                                </div>
                                            </div>

                                            {/* Acciones CRUD */}
                                            <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                                                <Link
                                                    href={`/${viewMode}/${item.id}`}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                                    title="Ver publicación"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>

                                                <Link
                                                    href={`/${viewMode === 'trabajos' ? 'trabajos' : 'servicios'}/${item.id}/editar`}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    Editar
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {viewMode === 'servicios' && (
                    <section>
                        {loadingServices ? (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse space-y-3">
                                        <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
                                        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                                        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : currentData.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center shadow-xs max-w-2xl mx-auto mt-10">
                                <div className="text-4xl mb-4 text-gray-300">📝</div>
                                <p className="text-gray-900 font-bold text-xl">Aún no tienes {viewMode} publicados</p>
                                <p className="text-gray-500 text-sm mt-2">Crea tu primera publicación para empezar a recibir ofertas de clientes o profesionales.</p>
                                <Link
                                    href={`/${viewMode === 'servicios' ? 'servicios' : 'servicios'}/nuevo`}
                                    className="inline-block mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                                >
                                    Crear {viewMode === 'servicios' ? 'Servicio' : 'Trabajo'}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {currentData.map((item) => {
                                    const isServicio = viewMode === "servicios";

                                    const titulo = isServicio ? item.oficio : item.title;
                                    const categoria = isServicio ? item.tipo_de_oficio : item.category;
                                    const precio = isServicio ? item.tarifa_promedio : item.budget;
                                    const fecha = isServicio ? item.actualizado_el : item.created_at;

                                    const fotosArray = isServicio ? item.fotos_urls : item.fotos_urls;
                                    const fotoPrincipal = fotosArray && fotosArray.length > 0
                                        ? fotosArray[0]
                                        : getCategoryImage(categoria);

                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                            {/* Foto y Badge de Estado */}
                                            <div className="relative h-44 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={fotoPrincipal}
                                                    alt={titulo}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                                <div className="absolute top-3 left-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border ${item.estado || item.status === 'Activo' ? 'bg-green-500 text-white border-green-600' : 'bg-amber-400 text-amber-900 border-amber-500'}`}>
                                                        Activo
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Información Principal */}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{categoria}</p>
                                                </div>
                                                <h3 className="font-bold text-gray-900 leading-snug line-clamp-2" title={titulo}>
                                                    {titulo}
                                                </h3>
                                                <div className="mt-auto pt-3">
                                                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                                                        Actualizado: {fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                                                    </p>
                                                    <p className="font-black text-gray-900 text-lg">${precio} <span className="text-xs text-gray-400">USD</span></p>
                                                </div>
                                            </div>

                                            {/* Acciones CRUD */}
                                            <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                                                <Link
                                                    href={`/${viewMode}/${item.id}`}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                                    title="Ver publicación"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>

                                                <Link
                                                    href={`/${viewMode === 'servicios' ? 'servicios' : 'trabajos'}/${item.id}/editar`}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    Editar
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}