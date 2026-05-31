import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-bold mb-6 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Disponible en toda Venezuela
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 tracking-tight">
            Soluciones técnicas{" "}
            <span className="text-blue-600">confiables</span> para tu hogar
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Encuentra expertos verificados en plomería, electricidad y más sin
            riesgos. Con pagos en garantía y precios justos garantizados.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-lg font-black shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
            >
              Comenzar ahora
            </Link>
            <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl text-lg font-bold transition-all">
              Ver servicios
            </button>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 5,000+ Técnicos
              Verificados
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Pagos 100% Seguros
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full transform -rotate-12 scale-110"></div>

          {/* Contenedor principal de la tarjeta */}
          <div className="relative bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 transform lg:rotate-3 transition-all hover:rotate-0 hover:scale-[1.02] duration-500">
            {/* Cabecera del Profesional */}
            <div className="relative aspect-4/3 bg-linear-to-br from-blue-50 to-gray-50 rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border border-gray-100 p-4">
              <div className="relative mb-3">
                <span className="text-6xl filter drop-shadow-sm">👨‍🔧</span>
                <span className="absolute bottom-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center truncate w-full">
                Carlos Mendoza
              </h3>
              <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mt-0.5">
                Técnico Electricista
              </p>

              {/* Insignia de Verificación */}
              <span className="absolute top-3 right-3 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a.75.75 0 00-.708.523.543.543 0 01-.307.354 1.42 1.42 0 00-.547.438.543.543 0 01-.456.111 1.42 1.42 0 00-.693.125.543.543 0 01-.428-.119 1.42 1.42 0 00-.604-.322.75.75 0 00-.916.516l-.16.54a.543.543 0 01-.274.379 1.42 1.42 0 00-.285.623.543.543 0 01-.06.467 1.42 1.42 0 00.038.692.543.543 0 01-.192.43 1.42 1.42 0 00-.332.61.75.75 0 00.343.993l.493.26a.543.543 0 01.272.38 1.42 1.42 0 00.567.412.543.543 0 01.316.346 1.42 1.42 0 00.672.203.543.543 0 01.442.215 1.42 1.42 0 00.627-.275.75.75 0 00.178-1.04l-.326-.457a.543.543 0 01-.044-.47 1.42 1.42 0 00-.17-.672.543.543 0 01.104-.46 1.42 1.42 0 00.453-.526.543.543 0 01.396-.237l.559-.044a.75.75 0 00.662-.777v-.115a.75.75 0 00-.662-.777l-.559-.044a.543.543 0 01-.396-.237 1.42 1.42 0 00-.453-.526.543.543 0 01-.104-.46 1.42 1.42 0 00.17-.672.543.543 0 01.044-.47l.326-.457a.75.75 0 00-.178-1.041z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificado
              </span>
            </div>

            {/* Fila de Calificación e Idioma */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-xs font-bold text-gray-700">4.9</span>
                <span className="text-[11px] text-gray-400">
                  (48 opiniones)
                </span>
              </div>
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                Disponible ya
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-5 line-clamp-2">
              Especialista en instalaciones residenciales, tableros eléctricos
              y mantenimiento preventivo seguro.
            </p>

            {/* Métricas clave */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                  Proyectos
                </p>
                <p className="text-base font-bold text-gray-800">
                  +120 éxitos
                </p>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100/70 rounded-xl text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 mb-0.5">
                  Garantía
                </p>
                <p className="text-base font-bold text-blue-700">
                  100% Segura
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
