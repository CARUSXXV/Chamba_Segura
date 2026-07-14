"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJobs, Job } from "@/api/jobs";
import { fetchServicios, Servicio } from "@/api/servicios";
import { useGeolocation } from "@/utils/useGeolocation";
import { getCategoryImage } from "@/app/lib/categoryImages";
import {
  getFavoriteJobs,
  toggleFavoriteJob,
  getFavoriteServices,
  toggleFavoriteService,
} from "@/utils/favorites";
import DashboardFooter from "./DashboardFooter";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default function AppDashboard() {
  const { user, session, signOut } = useAuth();
  const {
    location,
    formatDistance,
    loading: geoLoading,
    denied,
  } = useGeolocation();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Servicio[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  // ESTADOS DE FAVORITOS
  const [favoriteJobs, setFavoriteJobs] = useState<string[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteJobs(getFavoriteJobs());
    setFavoriteServices(getFavoriteServices());
  }, []);

  // ESTADOS DE UI
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"trabajos" | "servicios">(
    "trabajos",
  );

  // Inicia cerrada
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 👇 NUEVO ESTADO: Controla el menú desplegable del perfil
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const name =
    user?.user_metadata?.nombre_completo ||
    user?.user_metadata?.username ||
    "Usuario";
  const initial = (user?.user_metadata?.nombre_completo || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const categories = [
    { name: "Todo", icon: "🏠" },
    { name: "Favoritos", icon: "❤️" },
    { name: "Plomería", icon: "🚰" },
    { name: "Electricidad", icon: "⚡" },
    { name: "Carpintería", icon: "🛠️" },
    { name: "Limpieza", icon: "🧹" },
    { name: "Pintura", icon: "🎨" },
    { name: "Mecánica", icon: "🔧" },
    { name: "Jardinería", icon: "🌱" },
    { name: "Otros", icon: "✨" },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory =
      activeCategory === "Todo" ||
      (activeCategory === "Favoritos" ? favoriteJobs.includes(job.id) : job.category === activeCategory);
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      activeCategory === "Todo" ||
      (activeCategory === "Favoritos" ? favoriteServices.includes(service.id) : service.tipo_de_oficio === activeCategory);
    const matchesSearch =
      service.oficio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    async function loadJobs() {
      if (!session?.access_token) return;
      try {
        const data = await fetchJobs(session.access_token, {
          latitude: location?.latitude,
          longitude: location?.longitude,
        });
        setJobs(data);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    }
    loadJobs();
  }, [session, location, viewMode]);

  useEffect(() => {
    async function loadServices() {
      if (!session?.access_token) return;
      try {
        const data = await fetchServicios(session.access_token, {
          latitude: location?.latitude,
          longitude: location?.longitude,
        });
        setServices(data);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, [session, location, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* 1. TOP NAV */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <img
              src="/images/logo-azul.png"
              alt="ChambaSegura"
              className="h-9 w-auto"
            />
          </Link>

          {/* Barra de Búsqueda */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Buscar ${viewMode === "trabajos" ? "trabajos" : "servicios"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent text-gray-900 rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-sm placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 👇 NUEVO PERFIL CON MENÚ DESPLEGABLE 👇 */}
          <div className="relative flex items-center shrink-0">
            {/* Botón que abre/cierra el menú */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200 focus:outline-none"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-sm font-black border border-blue-200 shadow-sm">
                {initial}
              </div>
              <span className="hidden sm:block text-sm font-bold text-gray-700">
                {name.split(" ")[0]}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-in-out ${isProfileMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Capa invisible para detectar el clic fuera del menú y cerrarlo */}
            <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 ease-out ${
                isProfileMenuOpen
                  ? "opacity-100 visible"
                  : "opacity-0 invisible pointer-events-none"
              }`}
              onClick={() => setIsProfileMenuOpen(false)}
            />

            {/* Contenedor del Menú con animación fluida de entrada y salida */}
            <div
              className={`absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-50 flex flex-col origin-top-right transition-all duration-300 ease-out ${
                isProfileMenuOpen
                  ? "opacity-100 scale-100 translate-y-0 visible"
                  : "opacity-0 scale-95 -translate-y-4 invisible pointer-events-none"
              }`}
            >
              {/* Encabezado del Perfil */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <p className="font-black text-gray-900">{name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Opciones del menu */}
              <div className="p-2 flex flex-col gap-0.5">
                <Link
                  href="/trabajos"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    💼
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      Trabajos
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Explora trabajos, postúlate y publica
                    </span>
                  </div>
                </Link>

                <Link
                  href="/servicios"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cyan-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-cyan-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🔍
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      Servicios
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Busca y ofrece servicios profesionales
                    </span>
                  </div>
                </Link>

                <Link
                  href="/mensajeria"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      Mensajería
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Conversa con clientes y trabajadores
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/contrataciones"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-orange-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📄
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      Contrataciones
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Gestiona solicitudes y contratos
                    </span>
                  </div>
                </Link>

                <Link
                  href="/perfil"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-emerald-100/50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    👤
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      Mi Perfil
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Edita tu información personal
                    </span>
                  </div>
                </Link>
              </div>

              {/* Sección Inferior: Salir y Publicar */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-4">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full px-2 text-red-500 hover:text-red-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 stroke-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar Sesión
                </button>

                {/* Botones de Publicar Trabajo o Servicio (Color Verde) */}
                <div className="flex gap-2">
                  <Link
                    href="/trabajos/nuevo"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs transition-transform hover:scale-105 shadow-md shadow-green-500/20"
                  >
                    <svg
                      className="w-4 h-4 stroke-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    TRABAJO
                  </Link>
                  <Link
                    href="/servicios/nuevo"
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-transform hover:scale-105 shadow-md shadow-emerald-600/20"
                  >
                    <svg
                      className="w-4 h-4 stroke-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    SERVICIO
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* 👆 FIN DEL NUEVO PERFIL 👆 */}
        </div>
      </nav>

      {/* Dynamic Banner Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mt-6">
  <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-xs border border-gray-200 bg-white">
    
    {/* Banners de Fondo Originales (Intactos, tal cual los tenías) */}
    <img
      src="/images/16.png"
      alt="Trabajos"
      className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500 ease-in-out ${
        viewMode === "trabajos" ? "opacity-100" : "opacity-0"
      }`}
    />
    <img
      src="/images/17.png"
      alt="Servicios"
      className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-500 ease-in-out ${
        viewMode === "servicios" ? "opacity-100" : "opacity-0"
      }`}
    />

    {/* Contenido Dinámico con Deslizamiento Vertical (Evita saltos bruscos de UI) */}
    <div className="absolute inset-y-0 left-0 w-[55%] sm:w-1/2 md:w-[45%] flex flex-col justify-center pl-6 sm:pl-6 md:pl-8 lg:pl-10 z-20 font-poppins">
      
      {/* 1. Badge Superior Deslizable */}
      <div className="relative h-6 overflow-hidden mb-2">
        <div 
          className="flex flex-col transition-transform duration-500 ease-in-out"
          style={{ transform: viewMode === "trabajos" ? "translateY(0)" : "translateY(-50%)" }}
        >
          <div className="h-6 flex items-center">
            <span className="inline-block text-[9px] sm:text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full">
              Búsqueda de Empleo
            </span>
          </div>
          <div className="h-6 flex items-center">
            <span className="inline-block text-[9px] sm:text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full">
              Directorio de Servicios
            </span>
          </div>
        </div>
      </div>

      {/* 2. Título de Bienvenida (Estático, no cambia bruscamente) */}
      <h2 className="text-base sm:text-2xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
        ¡Bienvenido,{" "}
        <span className="text-blue-600">{name.split(" ")[0]}</span>!
      </h2>

      {/* 3. Textos Secundarios Deslizables (Asegura que quepan en h-40 y h-48 sin romperse) */}
      <div className="relative overflow-hidden mt-1.5 sm:mt-2.5 md:mt-3 h-12 sm:h-14 md:h-16">
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: viewMode === "trabajos" ? "translateY(0)" : "translateY(-50%)" }}
        >
          {/* Bloque Texto: Trabajos */}
          <div className="h-12 sm:h-14 md:h-16 flex flex-col justify-start">
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 font-semibold leading-snug truncate">
              Se publicaron <span className="text-blue-600 font-black">{jobs.length} trabajos</span> en nuestra plataforma.
            </p>
            <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500 mt-0.5 truncate">
              ¡Más de <span className="font-bold text-gray-800">1,000 trabajadores</span> confían en nosotros!
            </p>
          </div>

          {/* Bloque Texto: Servicios */}
          <div className="h-12 sm:h-14 md:h-16 flex flex-col justify-start">
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 font-semibold leading-snug truncate">
              Hoy se ofrecen <span className="text-emerald-600 font-black">{services.length} servicios</span> en nuestra plataforma.
            </p>
            <p className="text-[9px] sm:text-[11px] md:text-xs text-gray-500 mt-0.5 truncate">
              ¡Más de <span className="font-bold text-gray-800">600 profesionales</span> confían en nosotros!
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
      {/* 2. CONTENEDOR PRINCIPAL */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-2 flex gap-6 lg:gap-8 pb-6">
        {/* ========================================== */}
        {/* SIDEBAR DESKTOP (EMPUJA EL CONTENIDO)      */}
        {/* ========================================== */}
        {/* Al quitar el "absolute", la barra toma espacio físico y empuja las tarjetas hacia la derecha sin taparlas */}
        <aside
          className={`hidden md:block relative mt-50 mr-5 shrink-0 z-40 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-16"}`}
        >
          <div className="sticky top-28 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center p-3 border-b border-gray-100/80">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 flex shrink-0 items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                title={isSidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
              >
                <svg
                  className="w-5 h-5 stroke-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7 7 7"}
                  />
                </svg>
              </button>
              <span
                className={`ml-3 font-black text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
                }`}
              >
                Filtros
              </span>
            </div>

            <ul className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1 max-h-[calc(100vh-14rem)]">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.name;
                return (
                  <li key={cat.name}>
                    <button
                      onClick={() => setActiveCategory(cat.name)}
                      title={!isSidebarOpen ? cat.name : ""}
                      className={`w-full flex items-center p-2 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gray-900 text-white shadow-md"
                          : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-xl shrink-0 w-8 flex justify-center">
                        {cat.icon}
                      </span>
                      <span
                        className={`ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 text-left ${
                          isSidebarOpen
                            ? "max-w-[150px] opacity-100"
                            : "max-w-0 opacity-0 ml-0"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* ========================================== */}
        {/* MENÚ MÓVIL (DRAWER LATERAL)                */}
        {/* ========================================== */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={`md:hidden fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <span className="font-black text-gray-900 text-lg">Categorías</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-red-500 p-2 bg-gray-50 rounded-full cursor-pointer"
            >
              <svg
                className="w-5 h-5 stroke-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="p-4 space-y-2 overflow-y-auto">
            {categories.map((cat) => (
              <li key={`mob-${cat.name}`}>
                <button
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center p-4 rounded-2xl gap-4 transition-all cursor-pointer ${
                    activeCategory === cat.name
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-bold">{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ========================================== */}
        {/* CONTENIDO CENTRAL (TARJETAS)               */}
        {/* ========================================== */}
        <main className="flex-1 min-w-0">
          <header className="mb-8">
            {/* Controles de vista (Toggle Deslizante) */}
            <div className="relative w-20 grid grid-cols-2 bg-gray-200/60 p-1.5 m-auto rounded-2xl border border-gray-100 shrink-0 min-w-[280px] sm:min-w-[320px]">
              {/* 1. La "Pastilla" Blanca Animada (Fondo) */}
              <div className="absolute inset-0 p-1.5 pointer-events-none flex">
                <div
                  className={`w-1/2 h-full bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${
                    viewMode === "trabajos"
                      ? "translate-x-0"
                      : "translate-x-full"
                  }`}
                />
              </div>

              {/* 2. Botón Trabajos (Textos por encima de la pastilla) */}
              <button
                onClick={() => setViewMode("trabajos")}
                className={`relative z-10 py-2.5 font-bold text-sm transition-colors duration-300 cursor-pointer ${
                  viewMode === "trabajos"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                💼 Trabajos
              </button>

              {/* 3. Botón Servicios */}
              <button
                onClick={() => setViewMode("servicios")}
                className={`relative z-10 py-2.5 font-bold text-sm transition-colors duration-300 cursor-pointer ${
                  viewMode === "servicios"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                🛠️ Servicios
              </button>
            </div>

            {/* 👇 NUEVO BOTÓN DE FILTROS PARA MÓVILES 👇 */}
            {/* Solo se muestra en pantallas pequeñas, alineado al centro */}
            <div className="mt-6 md:hidden flex justify-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Mostrar Filtros
              </button>
            </div>
          </header>

          {searchQuery && (
            <div className="mb-6 flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <p className="text-sm font-medium text-blue-800">
                Resultados para:{" "}
                <span className="font-bold text-blue-900">"{searchQuery}"</span>{" "}
                en {activeCategory}
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA DE TRABAJOS                          */}
          {/* ========================================== */}
          {viewMode === "trabajos" && (
            <section className="animate-in fade-in duration-300">
              {loadingJobs ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
                      <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto shadow-xs">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-900 font-semibold text-lg">
                    No hay resultados
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Intenta con otra categoría o cambia los términos de
                    búsqueda.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory("Todo");
                      setSearchQuery("");
                    }}
                    className="mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/trabajos/${job.id}`}
                      className="group block cursor-pointer"
                    >
                      <div className="relative aspect-square mb-3.5 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/60 shadow-xs">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />

                        {(job as any).fotos_urls &&
                        (job as any).fotos_urls.length > 0 ? (
                          <img
                            src={(job as any).fotos_urls[0]}
                            alt={`Foto de ${job.title}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={getCategoryImage(job.category)}
                            alt={job.category}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        )}

                        <div className="absolute top-3 right-3 z-20">
                          <button
                            className={`w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                              favoriteJobs.includes(job.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setFavoriteJobs(toggleFavoriteJob(job.id));
                            }}
                          >
                            <svg
                              className="w-4 h-4 transition-colors duration-200"
                              fill={favoriteJobs.includes(job.id) ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={favoriteJobs.includes(job.id) ? "0" : "2"}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 px-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            className="font-bold text-gray-900 leading-snug truncate flex-1"
                            title={job.title}
                          >
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 text-sm font-semibold text-gray-900">
                            <span>⭐</span>
                            <span>
                              {job.perfiles?.rating_promedio
                                ? Number(job.perfiles.rating_promedio).toFixed(
                                    1,
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          {job.category}
                        </p>

                        {job.distancia_metros !== undefined &&
                        job.distancia_metros !== null ? (
                          <p className="text-sm text-blue-600 font-semibold">
                            📍 A {formatDistance(job.distancia_metros)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Sin ubicación exacta
                          </p>
                        )}

                        <p className="text-base font-black text-gray-900 pt-1">
                          ${job.budget || 0} USD
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================== */}
          {/* VISTA DE SERVICIOS                         */}
          {/* ========================================== */}
          {viewMode === "servicios" && (
            <section className="animate-in fade-in duration-300">
              {loadingServices ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
                      <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    </div>
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto shadow-xs">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-900 font-semibold text-lg">
                    No hay resultados
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Intenta con otra categoría o cambia los términos de
                    búsqueda.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory("Todo");
                      setSearchQuery("");
                    }}
                    className="mt-6 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {/* AQUÍ CORREGÍ EL MAP Y LA VARIABLE PARA USAR "servicio" EN VEZ DE "job" */}
                  {filteredServices.map((servicio) => (
                    <Link
                      key={servicio.id}
                      href={`/servicios/${servicio.id}`}
                      className="group block cursor-pointer"
                    >
                      <div className="relative aspect-square mb-3.5 overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/60 shadow-xs">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors z-10" />

                        {(servicio as any).fotos_urls &&
                        (servicio as any).fotos_urls.length > 0 ? (
                          <img
                            src={(servicio as any).fotos_urls[0]}
                            alt={`Foto de ${servicio.oficio}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={getCategoryImage(servicio.tipo_de_oficio)}
                            alt={servicio.tipo_de_oficio}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        )}

                        <div className="absolute top-3 right-3 z-20">
                          <button
                            className={`w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                              favoriteServices.includes(servicio.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setFavoriteServices(toggleFavoriteService(servicio.id));
                            }}
                          >
                            <svg
                              className="w-4 h-4 transition-colors duration-200"
                              fill={favoriteServices.includes(servicio.id) ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={favoriteServices.includes(servicio.id) ? "0" : "2"}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 px-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3
                            className="font-bold text-gray-900 leading-snug truncate flex-1"
                            title={servicio.oficio}
                          >
                            {servicio.oficio}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0 text-sm font-semibold text-gray-900">
                            <span>⭐</span>
                            <span>
                              {servicio.perfiles?.rating_promedio
                                ? Number(
                                    servicio.perfiles.rating_promedio,
                                  ).toFixed(1)
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          {servicio.tipo_de_oficio}
                        </p>

                        {servicio.distancia_metros !== undefined &&
                        servicio.distancia_metros !== null ? (
                          <p className="text-sm text-blue-600 font-semibold">
                            📍 A {formatDistance(servicio.distancia_metros)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Sin ubicación exacta
                          </p>
                        )}

                        {/* Ojo aquí: Si tus servicios manejan "precio" en vez de "budget", cámbialo en esta línea */}
                        <p className="text-base font-black text-gray-900 pt-1">
                          ${servicio.budget || 0} USD
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}
