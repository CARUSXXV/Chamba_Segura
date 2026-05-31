'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, signOut, isLoading } = useAuth();

  if (isLoading) {
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
            <button onClick={() => signOut()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all">Salir</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-500 mb-8">Información de tu cuenta.</p>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nombre completo</p>
              <p className="font-semibold text-gray-900">{user?.user_metadata?.nombre_completo || '—'}</p>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Nombre de usuario</p>
              <p className="font-semibold text-gray-900">{user?.user_metadata?.username || '—'}</p>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Correo electrónico</p>
              <p className="font-semibold text-gray-900">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tipo de cuenta</p>
              <p className="font-semibold text-gray-900">
                {user?.user_metadata?.es_trabajador ? 'Trabajador' : 'Cliente'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
