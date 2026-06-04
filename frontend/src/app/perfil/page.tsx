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
        } catch (err) {
          console.warn('Usando datos de sesión como respaldo.');
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
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Hubo un problema al intentar eliminar tu cuenta.');
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
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-500 text-sm mt-1">Información de tu cuenta.</p>
            </div>
            <Link 
              href="/perfil/editar"
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            >
              Editar Perfil
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="p-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nombre completo</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.nombre_completo || '—'}</p>
              </div>
            </div>
            <div className="p-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nombre de usuario</p>
                <p className="text-lg font-semibold text-gray-900">@{profileData.username || '—'}</p>
              </div>
            </div>

            <div className="p-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Correo de contacto</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.email_contacto || '—'}</p>
              </div>
            </div>
            <div className="p-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Teléfono de contacto</p>
                <p className="text-lg font-semibold text-gray-900">{profileData.telefono || '—'}</p>
              </div>
            </div>
            <div className="p-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Correo electrónico</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="p-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tipo de cuenta</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                  user?.user_metadata?.es_trabajador ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user?.user_metadata?.es_trabajador ? 'Trabajador' : 'Cliente'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Zona de Peligro (Danger Zone) */}
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8 mt-8 shadow-sm">
          <h3 className="text-lg font-bold text-red-800 mb-2">Zona de Peligro</h3>
          <p className="text-sm text-red-600 mb-6">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate bien antes de hacerlo.
          </p>
          <button 
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            {deleting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Eliminando...
              </span>
            ) : (
              'Eliminar mi cuenta permanentemente'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}