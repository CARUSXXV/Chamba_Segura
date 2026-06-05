'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { fetchProfileById, deleteProfile } from '@/api/profile';
import Link from 'next/link';

export default function VerPerfilPage() {
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre_completo: '',
    username: '',
    email_contacto: '',
    telefono: '',
  });



  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const loadProfile = async () => {
        try {
          // El token ya lleva tu ID encriptado. El backend sabe quién eres.
          const data = await fetchProfileById(session.access_token, user?.id as string);
          
          setProfileData({
            nombre_completo: data.nombre_completo || user?.user_metadata?.nombre_completo || '',
            username: data.username || user?.user_metadata?.username || '',
            email_contacto: data.email_contacto || '',
            telefono: data.telefono || '',
          });
        } catch (error) {
          console.warn('Usando datos de sesión como respaldo.', error);
          setProfileData({
            nombre_completo: user?.user_metadata?.nombre_completo || '',
            username: user?.user_metadata?.username || '',
            email_contacto: '',
            telefono: '',
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadProfile();
    }
  }, [authLoading, session, user, router]);

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;

    const confirmDelete = window.confirm(
      '¿Estás absolutamente seguro? Esta acción es irreversible y eliminará todos tus datos.'
    );
    
    if (!confirmDelete) return;

    setDeleting(true);

    try {
      // Usa aquí la función que tengas en tu api/profile.ts
      await deleteProfile(session.access_token, user?.id as string); 
      
      alert('Cuenta eliminada exitosamente.');
      signOut();
      router.push('/');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Hubo un problema al intentar eliminar tu cuenta.');
      setDeleting(false);
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
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user?.user_metadata?.es_trabajador ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {user?.user_metadata?.es_trabajador ? 'Trabajador' : 'Cliente'}
              </span>
              <Link 
                href="/perfil/editar"
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Editar
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Nombre completo</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{profileData.nombre_completo || '—'}</p>
              </div>
            </div>
            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Nombre de usuario</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">@{profileData.username || '—'}</p>
              </div>
            </div>

            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Correo de contacto</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{profileData.email_contacto || '—'}</p>
              </div>
            </div>
            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Teléfono de contacto</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{profileData.telefono || '—'}</p>
              </div>
            </div>
            <div className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Correo electrónico</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{user?.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Zona de Peligro (Danger Zone) */}
        <div className="bg-red-50 rounded-xl border border-red-200 px-6 py-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-800">Zona de Peligro</h3>
              <p className="text-xs text-red-600 mt-0.5">
                Eliminar tu cuenta es irreversible.
              </p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            >
              {deleting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Eliminando...
                </span>
              ) : (
                'Eliminar cuenta'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}