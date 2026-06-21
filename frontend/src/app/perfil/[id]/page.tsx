"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import EstrellasUsuario from "@/app/components/EstrellasUsuarios";
import { fetchProfileById } from "@/api/profile";


export default function PerfilPublicoPage() {
    const { id } = useParams(); // Capturamos el ID de la URL
    const { session } = useAuth();
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || !session?.access_token) return;

        if (id) {
            const loadProfile = async () => {
                try {
                    const data = await fetchProfileById(session.access_token, id as string);
                    setPerfil(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
                } finally {
                    setCargando(false);
                }
            };
            loadProfile();
        }
    }, [id, session]);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Botón de regreso */}
                <Link href="/dashboard/contrataciones" className="text-blue-600 font-semibold hover:underline mb-6 inline-block">
                    &larr; Volver a las postulaciones
                </Link>

                {/* Tarjeta del Perfil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">

                        {/* Avatar Grande */}
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 shadow-inner">
                            {perfil?.nombre_completo?.charAt(0) || "U"}
                        </div>

                        {/* Info y Estrellas */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-black text-gray-900">{perfil?.nombre_completo}</h1>
                            <p className="text-gray-500 font-medium mb-3">{perfil?.profesion || "Profesional Independiente"}</p>

                            {/* ¡Aquí brillan las estrellas automáticamente! */}
                            <div className="flex justify-center md:justify-start">
                                <EstrellasUsuario usuarioId={perfil?.id} token={session?.access_token || ""} />
                            </div>
                        </div>

                    </div>

                    <hr className="my-8 border-gray-100" />

                    {/* Más detalles (Biografía, oficios, etc.) */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Sobre mí</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {perfil?.bio || "Este usuario aún no ha escrito una biografía, pero sus reseñas hablan por él."}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

function fetchPerfilPorId(access_token: string, arg1: string) {
    throw new Error("Function not implemented.");
}

