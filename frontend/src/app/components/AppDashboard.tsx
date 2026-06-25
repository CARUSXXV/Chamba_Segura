'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { fetchJobs, Job } from '@/api/jobs';
import { useGeolocation } from '@/utils/useGeolocation';
import { getCategoryImage } from '@/app/lib/categoryImages';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function AppDashboard() {
  const { user, session, signOut } = useAuth();
  const { location, formatDistance, loading: geoLoading, denied } = useGeolocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const name = user?.user_metadata?.nombre_completo || user?.user_metadata?.username || 'Usuario';
  const initial = (user?.user_metadata?.nombre_completo || user?.email || 'U').charAt(0).toUpperCase();
  const links = [
    {
      href: '/trabajos',
      title: 'Mis Trabajos',
      desc: 'Explora trabajos, postúlate y publica',
      color: 'blue' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: '/servicios',
      title: 'Servicios',
      desc: 'Busca y ofrece servicios profesionales',
      color: 'sky' as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
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
    { label: 'Trabajos', value: jobs.length.toString(), color: 'text-blue-600' },
    { label: 'Servicios', value: '0', color: 'text-purple-600' },
    { label: 'Mensajes', value: '0', color: 'text-emerald-600' },
  ];

  const categories = [
    { name: 'Todo', icon: '🏠' },
    { name: 'Plomería', icon: '🚰' },
    { name: 'Electricidad', icon: '⚡' },
    { name: 'Carpintería', icon: '🛠️' },
    { name: 'Limpieza', icon: '🧹' },
    { name: 'Pintura', icon: '🎨' },
    { name: 'Mecánica', icon: '🔧' },
    { name: 'Jardinería', icon: '🌱' },
    { name: 'Otros', icon: '✨' },
  ];

  const [activeCategory, setActiveCategory] = useState('Todo');

  const filteredJobs = jobs.filter(job => activeCategory === 'Todo' || job.category === activeCategory);

  useEffect(() => {
    async function loadJobs() {
      if (!session?.access_token) return;
      try {
        const data = await fetchJobs(session.access_token, {
          latitude: location?.latitude,
          longitude: location?.longitude
        });
        setJobs(data);
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    }
    loadJobs();
  }, [session, location]);

  // --- Lógica Avanzada de Scroll de Categorías ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 2);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      checkScroll();
      scrollEl.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (scrollEl) scrollEl.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [jobs]);

  const handleScrollClick = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.6 : clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-black text-blue-600 tracking-tighter">
                ChambaSegura
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/perfil"
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-gray-200 transition-colors border border-gray-200">
                  {initial}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
        
        {/* Barra de Categorías Estilo Airbnb Avanzada */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center group pb-1">
          {/* Flecha Izquierda */}
          {showLeftArrow && (
            <div className="absolute left-4 sm:left-6 z-10 h-full flex items-center pr-10 pointer-events-none" style={{ background: 'linear-gradient(to right, white 40%, transparent 100%)' }}>
              <button
                type="button"
                onClick={() => handleScrollClick('left')}
                className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all cursor-pointer pointer-events-auto text-gray-600 hover:text-gray-900"
                aria-label="Desplazar a la izquierda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Contenedor Deslizable */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className={`w-full flex items-center gap-8 py-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth select-none ${
              isDown ? 'cursor-grabbing' : 'cursor-default'
            }`}
            style={{ scrollbarWidth: 'none' }}
          >
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => !isDown && setActiveCategory(cat.name)}
                  role="tab"
                  aria-selected={isSelected}
                  className={`
                    flex flex-col items-center gap-1.5 pb-2 pt-1
                    transition-all duration-200 ease-in-out shrink-0 snap-start
                    border-b-2 outline-none cursor-pointer active:scale-95
                    ${
                      isSelected 
                        ? 'border-gray-900 text-gray-950 font-semibold opacity-100' 
                        : 'border-transparent text-gray-500 opacity-70 hover:opacity-100 hover:text-gray-900 hover:border-gray-300'
                    }
                    focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 rounded-sm
                  `}
                  style={{ minWidth: '64px', maxWidth: '110px' }}
                >
                  <span className="text-2xl pointer-events-none" aria-hidden="true">
                    {cat.icon}
                  </span>
                  
                  <span className="text-[11px] tracking-wide text-center truncate w-full px-0.5 pointer-events-none">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Flecha Derecha */}
          {showRightArrow && (
            <div className="absolute right-4 sm:right-6 z-10 h-full flex items-center pl-10 pointer-events-none" style={{ background: 'linear-gradient(to left, white 40%, transparent 100%)' }}>
              <button
                type="button"
                onClick={() => handleScrollClick('right')}
                className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:scale-105 hover:shadow-lg active:scale-95 transition-all cursor-pointer pointer-events-auto text-gray-600 hover:text-gray-900"
                aria-label="Desplazar a la derecha"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {getGreeting()}, {name.split(' ')[0]}
            </h1>
            <p className="text-gray-500 mt-2 text-lg">¿Qué planes tienes para hoy?</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
              Panel de Control
            </span>
          </div>
        </header>

        {/* Jobs Grid (Primary Content) */}
        <section className="mb-20">
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Trabajos Cercanos</h2>
    <Link 
      href="/trabajos" 
      className="text-sm font-bold text-gray-900 underline underline-offset-4 hover:text-blue-600 transition-colors cursor-pointer"
    >
      Ver todos
    </Link>
  </div>
  
  {loadingJobs ? (
    /* Skeleton Loader Optimizado en Proporciones */
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-4 bg-gray-200 rounded-full w-2/3" />
            <div className="h-4 bg-gray-200 rounded-full w-8" />
          </div>
          <div className="h-3 bg-gray-100 rounded-full w-1/3" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
          <div className="h-4 bg-gray-200 rounded-full w-1/4 mt-2" />
        </div>
      ))}
    </div>
  ) : filteredJobs.length === 0 ? (
    /* Empty State Rediseñado y Limpio */
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto my-4 shadow-xs">
      <div className="text-4xl mb-4">🔍</div>
      <p className="text-gray-900 font-semibold text-lg">No hay resultados disponibles</p>
      <p className="text-gray-500 text-sm mt-1">No se encontraron trabajos en esta categoría en este momento.</p>
      <button 
        onClick={() => setActiveCategory('Todo')}
        className="mt-5 inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
      >
        Limpiar filtros
      </button>
    </div>
  ) : (
    /* Grid de Trabajos Premium */
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredJobs.map((job) => (
        <Link key={job.id} href={`/trabajos/${job.id}`} className="group block cursor-pointer">
          
          {/* Contenedor de Imagen / Ícono con Efectos visuales */}
          <div className="relative aspect-square mb-3.5 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/60 shadow-xs">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />
            
            {/* Imagen real por categoría */}
            <img
              src={getCategoryImage(job.category)}
              alt={job.category}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Botón Favorito (Estilo Airbnb Flotante) */}
            <div className="absolute top-3 right-3 z-20">
              <button 
                type="button"
                className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 hover:scale-105 active:scale-90 transition-all cursor-pointer"
                onClick={(e) => {
                  e.preventDefault(); // Evita que abra el enlace del trabajo
                  // Aquí puedes meter tu lógica de favoritos
                }}
              >
                <svg className="w-4 h-4 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Información del Trabajo */}
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-gray-900 leading-snug truncate flex-1" title={job.title}>
                {job.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0 text-sm font-semibold text-gray-900">
               <span>⭐</span>
                        <span className="text-sm font-medium">
                          {job.perfiles?.rating_promedio !== null && job.perfiles?.rating_promedio !== undefined
                            ? Number(job.perfiles.rating_promedio).toFixed(1)
                            : 'N/A'}
                        </span>
              </div>
            </div>
            
            <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">
              {job.category}
            </p>
            
            {/* Estado de Ubicación e Indicadores con mejor feedback */}
            {job.distancia_metros !== undefined && job.distancia_metros !== null ? (
              <p className="text-sm text-blue-600 font-semibold flex items-center gap-1">
                <span>📍</span> A {formatDistance(job.distancia_metros)}
              </p>
            ) : job.ubicacion ? (
              <p className={`text-sm font-medium ${geoLoading ? 'text-blue-500 animate-pulse' : location ? 'text-blue-400' : denied ? 'text-amber-600' : 'text-gray-400'}`}>
                {geoLoading ? 'Calculando distancia...' : location ? 'Cargando distancia...' : denied ? 'Activa tu ubicación para medir distancia' : 'Ubicación no disponible'}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Sin ubicación especificada</p>
            )}
            
            {/* Precio / Presupuesto resaltado */}
            <p className="text-[15px] font-extrabold text-gray-900 pt-1">
              ${job.budget || 0} USD
            </p>
          </div>

        </Link>
      ))}
    </div>
  )}
</section>

        <div className="mt-20 grid gap-12 lg:grid-cols-3">
  {/* Quick Actions / Management Section */}
  <section className="lg:col-span-2">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-xs">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gestión de Cuenta</h2>
    </div>
    
    <div className="grid gap-4 sm:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-xs hover:shadow-md hover:border-gray-200/80 transition-all duration-200 cursor-pointer active:scale-[0.99]"
        >
          {/* Ícono de Acción con Zoom */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${colorMap[link.color as keyof typeof colorMap]}`}>
            {link.icon}
          </div>
          
          {/* Textos con protección de desbordamiento */}
          <div className="min-w-0 flex-1 transition-transform duration-200 group-hover:translate-x-0.5">
            <h3 className="font-bold text-sm text-gray-900 truncate">{link.title}</h3>
            <p className="text-xs text-gray-500 truncate mt-0.5">{link.desc}</p>
          </div>

          {/* Flecha indicadora sutil estilo iOS/SaaS */}
          <div className="text-gray-300 group-hover:text-gray-500 transition-colors pr-1 shrink-0 hidden sm:block">
            <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  </section>

  {/* Stats & Activity Sidebar */}
  <aside className="space-y-10">
    {/* Sección de Estadísticas */}
    <section>
      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Estadísticas</h2>
      <div className="grid gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex justify-between items-center transition-all hover:border-gray-200/60"
          >
            <div className="flex items-center gap-2.5">
              {/* Punto de color decorativo */}
              <span className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
              <span className="text-sm font-bold text-gray-500">{stat.label}</span>
            </div>
            <span className={`text-xl font-black tracking-tight ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Sección de Actividad */}
    <section>
      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Actividad</h2>
      <div className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center shadow-xs flex flex-col items-center justify-center">
        {/* Pequeño indicador visual para el estado vacío */}
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3 text-lg">
          📭
        </div>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-[200px] mx-auto">
          No hay actividad registrada en tu cuenta recientemente.
        </p>
        <Link
          href="/trabajos"
          className="inline-flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-blue-600 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl border border-gray-100 transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          Empezar ahora
        </Link>
      </div>
    </section>
  </aside>
</div>
      </main>
    </div>
  );
}