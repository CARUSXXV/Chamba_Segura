'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function AppDashboard() {
  const { user, signOut } = useAuth();

  const name = user?.user_metadata?.nombre_completo || user?.user_metadata?.username || 'Usuario';
  const initial = (user?.user_metadata?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase();
  const esTrabajador = user?.user_metadata?.es_trabajador === true;

  const links = [
    ...(esTrabajador
      ? [{
          href: '/trabajos',
          title: 'Mis Trabajos',
          desc: 'Busca trabajos y postúlate',
          color: 'blue' as const,
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        }]
      : [
          {
            href: '/trabajos',
            title: 'Mis Trabajos',
            desc: 'Tus trabajos publicados y postulaciones',
            color: 'blue' as const,
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            href: '/servicios',
            title: 'Buscar Servicios',
            desc: 'Encuentra al profesional ideal',
            color: 'sky' as const,
            icon: (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
          },
        ]),
    {
      href: '/mensajeria',
      title: 'Mensajería',
      desc: 'Conversa con clientes y trabajadores',
      color: 'purple',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/contrataciones',
      title: 'Contrataciones',
      desc: 'Gestiona solicitudes y contratos',
      color: 'amber',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/perfil',
      title: 'Mi Perfil',
      desc: 'Edita tu información personal',
      color: 'emerald',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100 group-hover:text-purple-700',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:text-amber-700',
    sky: 'bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:text-sky-700',
  };

  const stats = [
    { label: esTrabajador ? 'Trabajos activos' : 'Trabajadores disponibles', value: '—', color: 'text-blue-600' },
    { label: esTrabajador ? 'Servicios completados' : 'Trabajos publicados', value: '—', color: 'text-purple-600' },
    { label: 'Mensajes nuevos', value: '—', color: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="text-lg font-black text-blue-600 tracking-tighter">
              ChambaSegura
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                {initial}
              </div>
              <span className="hidden sm:inline">{name}</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 to-blue-600" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">{getGreeting()}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  esTrabajador ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {esTrabajador ? 'Trabajador' : 'Cliente'}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-md leading-relaxed">
              {esTrabajador
                ? 'Ofrece tus servicios y consigue más clientes hoy.'
                : 'Encuentra al profesional ideal para tu próximo proyecto.'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: link.color === 'blue' ? '#2563eb' : link.color === 'purple' ? '#9333ea' : '#059669' }}
              />
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                  colorMap[link.color as keyof typeof colorMap]
                }`}>
                  {link.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900">{link.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{link.desc}</p>
                </div>
              </div>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900">Actividad Reciente</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">
              Aún no tienes actividad. {esTrabajador ? 'Publica un servicio' : 'Explora los trabajos'} para empezar.
            </p>
            <Link
              href={esTrabajador ? '/trabajos' : '/servicios'}
              className="inline-flex items-center gap-1 mt-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
            >
              {esTrabajador ? 'Ir a mis trabajos' : 'Ver servicios disponibles'}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
