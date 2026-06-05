'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { updateProfile, deleteMyProfile, fetchProfileById } from '@/api/profile';
import Link from 'next/link';

export default function EditarPerfilPage() {
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    nombre_completo: '',
    username: '',
    email_contacto: '',
    telefono: '',
  });

  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            email_contacto: data.email_contacto || user?.user_metadata?.email_contacto || '',
            telefono: data.telefono || user?.user_metadata?.telefono || '',
          });
        } catch (error) {
          console.warn('Usando datos de sesión como respaldo.', error);
          setProfileData({
            nombre_completo: user?.user_metadata?.nombre_completo || '',
            username: user?.user_metadata?.username || '',
            email_contacto: user?.user_metadata?.email_contacto || '',
            telefono: user?.user_metadata?.telefono || '',
          });
        } finally {
          setLoading(false);
        }
      };
      
      loadProfile();
    
  }
  }, [authLoading, session, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setSaving(true);
    setError(null);

    try {
      await updateProfile(session.access_token, user?.id as string, {
        nombre_completo: profileData.nombre_completo,
        username: profileData.username,
        email_contacto: profileData.email_contacto,
        telefono: profileData.telefono,
      });

      router.push('/perfil');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;
    const confirmDelete = window.confirm('¿Estás absolutamente seguro? Esta acción eliminará todo.');
    if (!confirmDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteMyProfile(session.access_token);
      alert('Cuenta eliminada exitosamente.');
      signOut();
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar la cuenta.');
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
        <Link href="/perfil" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Cancelar y volver
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-500 text-sm mt-1">Modifica tus datos públicos.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={profileData.nombre_completo}
                  onChange={(e) => setProfileData({ ...profileData, nombre_completo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de Usuario</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={profileData.email_contacto}
                  onChange={(e) => setProfileData({ ...profileData, email_contacto: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  value={profileData.telefono}
                  onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-6 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 flex justify-center items-center"
            >
              {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Zona de Peligro */}
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8">
          <h3 className="text-lg font-bold text-red-800 mb-2">Zona de Peligro</h3>
          <p className="text-sm text-red-600 mb-4">Esta acción es irreversible y eliminará todos tus datos.</p>
          <button 
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Eliminar mi cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}