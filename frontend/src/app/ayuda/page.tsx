"use client";

import { useState } from "react";
import InfoNavigation from "../components/InfoNavigation";
import InfoFooter from "../components/InfoFooter";
import Link from "next/link";

const faqs = [
  {
    categoria: "General",
    preguntas: [
      {
        q: "¿Qué es ChambaSegura?",
        r: "ChambaSegura es una plataforma digital venezolana que conecta a personas que necesitan servicios técnicos para el hogar con profesionales del área. Ofrecemos un entorno confiable para la contratación de servicios como plomería, electricidad, carpintería, limpieza, pintura, mecánica, jardinería y más."
      },
      {
        q: "¿Cómo funciona la plataforma?",
        r: "Es muy simple: publica el trabajo que necesitas, recibe propuestas de técnicos cercanos a tu ubicación, compara perfiles, precios y calificaciones, y contrata al profesional que mejor se adapte a tus necesidades. Una vez finalizado el servicio, calificas al técnico para ayudar a la comunidad."
      },
      {
        q: "¿En qué ciudades de Venezuela está disponible?",
        r: "Actualmente la plataforma está disponible en todo el territorio venezolano. La cercanía de los resultados depende de la ubicación que compartas al publicar o buscar servicios."
      },
      {
        q: "¿Es seguro usar ChambaSegura?",
        r: "Sí. La plataforma cuenta con autenticación de usuarios, sistema de calificaciones y reseñas, y mensajería integrada para que puedas comunicarte directamente con los profesionales."
      }
    ]
  },
  {
    categoria: "Registro y Cuenta",
    preguntas: [
      {
        q: "¿Cómo me registro en ChambaSegura?",
        r: "Puedes registrarte haciendo clic en \"Registrarse\" en la esquina superior derecha. Solo necesitas un correo electrónico válido, crear una contraseña segura y completar tus datos básicos. El proceso toma menos de 2 minutos."
      },
      {
        q: "¿Es gratuito registrarse?",
        r: "Sí, el registro es completamente gratuito. Puedes crear tu cuenta, explorar trabajos y servicios, y chatear con otros usuarios sin costo alguno."
      },
      {
        q: "Olvidé mi contraseña, ¿cómo la recupero?",
        r: "En la pantalla de inicio de sesión, haz clic en \"¿Olvidaste tu contraseña?\" e ingresa tu correo electrónico. Te enviaremos un enlace seguro para restablecerla."
      },
      {
        q: "¿Puedo eliminar mi cuenta?",
        r: "Sí, puedes eliminar tu cuenta en cualquier momento desde la sección de perfil. Ten en cuenta que al hacerlo se eliminarán tus datos personales de la plataforma, aunque los registros de transacciones completadas se conservarán por obligaciones legales."
      }
    ]
  },
  {
    categoria: "Para Contratantes",
    preguntas: [
      {
        q: "¿Cómo publico un trabajo?",
        r: "Inicia sesión, haz clic en \"Publicar Trabajo\" en el menú de perfil. Describe el servicio que necesitas, establece tu presupuesto, selecciona la categoría y tu ubicación. Los técnicos registrados cercanos comenzarán a enviarte propuestas."
      },
      {
        q: "¿Cómo elijo al técnico adecuado?",
        r: "Revisa los perfiles de los técnicos que te envían propuestas. Presta atención a: calificaciones y reseñas de otros usuarios, precio ofertado, tiempo de respuesta, foto de perfil y descripción profesional. Puedes chatear con ellos antes de decidir."
      },
      {
        q: "¿Qué hago si el servicio no se completa?",
        r: "Si surge algún problema, puedes comunicarte con el técnico a través del chat de la plataforma para resolver la situación directamente. Si no llegas a un acuerdo, puedes dejar una reseña que refleje tu experiencia."
      },
      {
        q: "¿Cómo funcionan los pagos?",
        r: "Los pagos se acuerdan directamente entre el contratante y el técnico. La plataforma actualmente no procesa pagos, por lo que te recomendamos acordar el método de pago antes de iniciar el servicio."
      }
    ]
  },
  {
    categoria: "Para Técnicos",
    preguntas: [
      {
        q: "¿Cómo me registro como técnico?",
        r: "Al registrarte, completa tu perfil profesional incluyendo tus especialidades, experiencia y datos de contacto. No hay distinción de roles, cualquier usuario registrado puede tanto solicitar servicios como ofrecerlos."
      },
      {
        q: "¿Qué información debo incluir en mi perfil?",
        r: "Recomendamos incluir una foto de perfil, una descripción profesional detallada, tus áreas de especialización, y mantener actualizados tus datos de contacto. Esto ayuda a generar confianza con los contratantes."
      },
      {
        q: "¿Cómo recibo pagos?",
        r: "Los pagos se gestionan directamente entre tú y el contratante. La plataforma no participa en las transacciones económicas, por lo que debes acordar el método y condiciones de pago con cada cliente."
      }
    ]
  },
  {
    categoria: "Contrataciones",
    preguntas: [
      {
        q: "¿Qué es una contratación?",
        r: "Una contratación es el acuerdo formal entre un contratante y un técnico dentro de la plataforma. Puedes gestionar tus contrataciones activas, aceptar o rechazar solicitudes, y dar seguimiento al estado de cada servicio desde el panel de contrataciones."
      },
      {
        q: "¿Cómo cancelo una contratación?",
        r: "Desde la sección de contrataciones, puedes cancelar una solicitud siempre que el servicio no esté en progreso. Si el servicio ya fue iniciado, te recomendamos comunicarte con la otra parte para llegar a un acuerdo."
      },
      {
        q: "¿Cómo califico a un usuario?",
        r: "Una vez finalizado el servicio, puedes calificar al técnico con una puntuación de 1 a 5 estrellas y dejar un comentario. Las calificaciones ayudan a construir una comunidad transparente y de confianza."
      }
    ]
  }
];

function AccordionItem({
  pregunta,
  respuesta,
  isOpen,
  onToggle
}: {
  pregunta: string;
  respuesta: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50/50 transition-colors cursor-pointer"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{pregunta}</span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
          {respuesta}
        </div>
      </div>
    </div>
  );
}

export default function AyudaPage() {
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFaq = (key: string) => {
    setOpenFaqs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const todasLasPreguntas = faqs.flatMap(cat =>
    cat.preguntas.map(p => ({ ...p, categoria: cat.categoria }))
  );

  const filteredFaqs = searchTerm.trim()
    ? todasLasPreguntas.filter(
        p =>
          p.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.r.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const hasSearchResults = searchTerm.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      <InfoNavigation />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-bold mb-4 uppercase tracking-wider">
              Centro de Ayuda
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Encuentra respuestas a las preguntas más frecuentes sobre el uso de la plataforma.
            </p>
          </div>

          {/* Buscador */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar en el centro de ayuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-base placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {hasSearchResults && (
            <section className="mb-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resultados para &ldquo;{searchTerm}&rdquo;
              </h2>
              {filteredFaqs.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-12 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-900 font-semibold">Sin resultados</p>
                  <p className="text-gray-500 text-sm mt-1">Intenta con otros términos de búsqueda.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, i) => (
                    <AccordionItem
                      key={`search-${i}`}
                      pregunta={faq.q}
                      respuesta={faq.r}
                      isOpen={openFaqs[`search-${i}`] || false}
                      onToggle={() => toggleFaq(`search-${i}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* FAQ por categorías */}
          {!hasSearchResults && (
            <div className="space-y-16">
              {faqs.map((cat) => (
                <section key={cat.categoria}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{cat.categoria}</h2>
                  <div className="space-y-3">
                    {cat.preguntas.map((faq, i) => {
                      const key = `${cat.categoria}-${i}`;
                      return (
                        <AccordionItem
                          key={key}
                          pregunta={faq.q}
                          respuesta={faq.r}
                          isOpen={openFaqs[key] || false}
                          onToggle={() => toggleFaq(key)}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Sección de contacto */}
          <section className="mt-20 pt-12 border-t border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¿No encontraste lo que buscabas?</h2>
            <p className="text-gray-500 mb-8">
              Explora nuestras otras secciones de ayuda o vuelve al inicio.
            </p>
          </section>

          {/* Enlaces relacionados */}
          <section className="pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/terminos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Términos y Condiciones
              </Link>
              <Link
                href="/privacidad"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Política de Privacidad
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                Volver al inicio
              </Link>
            </div>
          </section>
        </div>
      </main>

      <InfoFooter />
    </div>
  );
}
