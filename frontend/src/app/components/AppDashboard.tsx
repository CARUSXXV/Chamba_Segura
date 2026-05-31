'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AppDashboard() {
  const { user, signOut } = useAuth();

  const esTrabajador = user?.user_metadata?.es_trabajador === true;

  const links = [
    {
      href: '/trabajos',
      title: esTrabajador ? 'Mis Trabajos' : 'Buscar Trabajadores',
      desc: esTrabajador ? 'Gestiona tus trabajos y servicios' : 'Encuentra el profesional ideal',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: '/mensajeria',
      title: 'Mensajería',
      desc: 'Conversa con clientes y trabajadores',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      href: '/perfil',
      title: 'Mi Perfil',
      desc: 'Edita tu información personal',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-black text-blue-600 tracking-tighter">
              ChambaSegura
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/perfil"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {user?.user_metadata?.nombre_completo || user?.email}
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Bienvenido, {user?.user_metadata?.nombre_completo || user?.user_metadata?.username || 'Usuario'}
          </h1>
          <p className="mt-1 text-gray-500">
            {esTrabajador
              ? 'Estás registrado como Trabajador — ofrece tus servicios'
              : 'Estás registrado como Cliente — encuentra al profesional que necesitas'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                {link.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{link.title}</h2>
              <p className="text-sm text-gray-500">{link.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <p className="text-gray-400 text-sm">
            Aún no tienes actividad. Comienza explorando los trabajos disponibles.
          </p>
        </div>
      </main>
    </div>
  );
}
