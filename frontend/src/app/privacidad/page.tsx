"use client";

import InfoNavigation from "../components/InfoNavigation";
import InfoFooter from "../components/InfoFooter";
import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      <InfoNavigation />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-bold mb-4 uppercase tracking-wider">
              Privacidad
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Política de Privacidad
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Última actualización: <span className="font-semibold text-gray-700">13 de julio de 2026</span>
            </p>
          </div>

          {/* Barra de navegación interna */}
          <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-10">
            <nav className="flex gap-6 text-sm font-medium text-gray-500 overflow-x-auto">
              <a href="#alcance" className="hover:text-blue-600 transition-colors whitespace-nowrap">Alcance</a>
              <a href="#datos" className="hover:text-blue-600 transition-colors whitespace-nowrap">Datos Recopilados</a>
              <a href="#uso" className="hover:text-blue-600 transition-colors whitespace-nowrap">Uso</a>
              <a href="#base-legal" className="hover:text-blue-600 transition-colors whitespace-nowrap">Base Legal</a>
              <a href="#compartir" className="hover:text-blue-600 transition-colors whitespace-nowrap">Compartir Datos</a>
              <a href="#derechos" className="hover:text-blue-600 transition-colors whitespace-nowrap">Tus Derechos</a>
              <a href="#seguridad" className="hover:text-blue-600 transition-colors whitespace-nowrap">Seguridad</a>
              <a href="#cookies" className="hover:text-blue-600 transition-colors whitespace-nowrap">Cookies</a>
              <a href="#menores" className="hover:text-blue-600 transition-colors whitespace-nowrap">Menores</a>
              <a href="#cambios" className="hover:text-blue-600 transition-colors whitespace-nowrap">Cambios</a>
            </nav>
          </div>

          {/* Contenido */}
          <div className="space-y-10">

            <section id="alcance">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Alcance de esta Política</h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  Esta <strong>Política de Privacidad</strong> describe cómo <strong>ChambaSegura</strong> (en adelante, &laquo;la Plataforma&raquo;,
                  &laquo;nosotros&raquo; o &laquo;nuestro&raquo;) recopila, utiliza, almacena, protege y gestiona los datos personales
                  de los usuarios de la Plataforma, en cumplimiento con la legislación vigente en la
                  <strong> República Bolivariana de Venezuela</strong>.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Al registrarse y utilizar la Plataforma, el usuario acepta expresamente las prácticas 
                descritas en esta política. Si no está de acuerdo, deberá abstenerse de utilizar nuestros servicios.
              </p>
            </section>

            <section id="datos" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datos Personales que Recopilamos</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">2.1 Información proporcionada por el usuario</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-sm">Datos de registro</span>
                      <p className="text-xs text-gray-500 mt-1">Nombre completo, correo electrónico, número de teléfono, dirección y contraseña cifrada.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-sm">Datos de perfil</span>
                      <p className="text-xs text-gray-500 mt-1">Foto de perfil, descripción profesional, habilidades, experiencia laboral y referencias.</p>
                    </div>

                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">2.2 Información recopilada automáticamente</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-sm">Datos de navegación</span>
                      <p className="text-xs text-gray-500 mt-1">Dirección IP, tipo de navegador, sistema operativo, páginas visitadas y duración de la sesión.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-sm">Datos de ubicación</span>
                      <p className="text-xs text-gray-500 mt-1">Ubicación geográfica aproximada para mostrar servicios y trabajos cercanos (con consentimiento del usuario).</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-sm">Cookies y tecnologías similares</span>
                      <p className="text-xs text-gray-500 mt-1">Cookies esenciales necesarias para el funcionamiento básico de la Plataforma, incluyendo autenticación y seguridad.</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <span className="font-semibold text-gray-900 text-sm">Datos de comunicación</span>
                      <p className="text-xs text-gray-500 mt-1">Mensajes enviados a través de la plataforma y registros de soporte técnico.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="uso" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalidad del Tratamiento de Datos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Los datos personales recopilados son tratados con las siguientes finalidades:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">🛡️</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Gestión de la cuenta</h3>
                    <p className="text-xs text-gray-500">Creación, mantenimiento y administración de la cuenta de usuario.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">🔗</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Intermediación de servicios</h3>
                    <p className="text-xs text-gray-500">Conectar a contratantes con técnicos y facilitar la contratación de servicios.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">💳</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Procesamiento de pagos</h3>
                    <p className="text-xs text-gray-500">Gestionar las transacciones económicas entre las partes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">🔒</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Seguridad de la Plataforma</h3>
                    <p className="text-xs text-gray-500">Proteger la integridad de la Plataforma y prevenir actividades no autorizadas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">📊</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Mejora del servicio</h3>
                    <p className="text-xs text-gray-500">Analizar el uso de la Plataforma para optimizar la experiencia del usuario.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">📧</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Comunicaciones</h3>
                    <p className="text-xs text-gray-500">Enviar notificaciones relacionadas con el servicio, actualizaciones y soporte.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="base-legal" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base Legal para el Tratamiento</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                El tratamiento de datos personales se fundamenta en las siguientes bases legales, conforme
                al ordenamiento jurídico venezolano:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-gray-700"><strong>Consentimiento expreso</strong> del titular de los datos al momento de registrarse en la Plataforma.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-gray-700"><strong>Ejecución de un contrato</strong> de servicios entre el usuario y ChambaSegura, o entre usuarios de la Plataforma.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-gray-700"><strong>Cumplimiento de obligaciones legales</strong> aplicables en la República Bolivariana de Venezuela.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span className="text-gray-700"><strong>Interés legítimo</strong> de ChambaSegura para mejorar sus servicios, prevenir fraudes y garantizar la seguridad de la Plataforma.</span>
                </li>
              </ul>
            </section>

            <section id="compartir" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compartición de Datos con Terceros</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChambaSegura no vende, alquila ni comercializa datos personales de sus usuarios. 
                Podemos compartir información con:
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Proveedores de pago</h3>
                  <p className="text-xs text-gray-500">Entidades financieras y procesadores de pago para gestionar transacciones.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Servicios de infraestructura</h3>
                  <p className="text-xs text-gray-500">Proveedores de hosting, almacenamiento en la nube y CDN (Content Delivery Network).</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Autoridades competentes</h3>
                  <p className="text-xs text-gray-500">Cuando sea requerido por ley o por orden judicial emanada de tribunales venezolanos.</p>
                </div>
              </div>
            </section>

            <section id="derechos" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Derechos del Usuario</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                De conformidad con la Constitución de la República Bolivariana de Venezuela y las leyes 
                aplicables, el usuario tiene los siguientes derechos sobre sus datos personales:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 text-sm mb-1">Acceso</h3>
                  <p className="text-xs text-blue-600">Solicitar una copia de los datos personales que tenemos sobre usted.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 text-sm mb-1">Rectificación</h3>
                  <p className="text-xs text-blue-600">Solicitar la corrección de datos inexactos o desactualizados.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 text-sm mb-1">Supresión</h3>
                  <p className="text-xs text-blue-600">Solicitar la eliminación de sus datos personales, cuando ya no sean necesarios.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="font-bold text-blue-800 text-sm mb-1">Oposición</h3>
                  <p className="text-xs text-blue-600">Oponerse al tratamiento de sus datos para fines específicos.</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                Para ejercer estos derechos, el usuario puede dirigirse a través de la sección de perfil 
                de la Plataforma o enviando un correo electrónico a{' '}
                <a href="mailto:privacidad@chambasegura.com" className="text-blue-600 hover:text-blue-700 font-semibold">privacidad@chambasegura.com</a>.
                Responderemos a su solicitud en un plazo máximo de <strong>30 días continuos</strong>.
              </p>
            </section>

            <section id="seguridad" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Medidas de Seguridad</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChambaSegura implementa medidas de seguridad técnicas, organizativas y administrativas 
                para proteger los datos personales contra accesos no autorizados, pérdida, alteración o 
                divulgación indebida:
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Cifrado en tránsito
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Autenticación de usuarios
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Control de acceso
                </span>
              </div>
            </section>

            <section id="cookies" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Política de Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChambaSegura utiliza cookies esenciales necesarias para el funcionamiento básico de la 
                Plataforma. Estas cookies son necesarias para la autenticación del usuario y la seguridad 
                de la sesión.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-sm">Cookies esenciales</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Siempre activas</span>
                </div>
                <p className="text-xs text-gray-500">Necesarias para el funcionamiento básico de la Plataforma. Incluyen autenticación y seguridad de la sesión.</p>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                El usuario puede configurar el uso de cookies desde la configuración de su navegador. 
                Sin embargo, las cookies esenciales son necesarias para el funcionamiento de la Plataforma.
              </p>
            </section>

            <section id="menores" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
              <p className="text-gray-700 leading-relaxed">
                La Plataforma está dirigida exclusivamente a personas mayores de 18 años. ChambaSegura 
                no recopila intencionalmente datos personales de menores de edad. Si tenemos conocimiento 
                de que se ha recopilado información de un menor sin consentimiento parental, procederemos 
                a eliminarla de inmediato.
              </p>
            </section>

            <section id="cambios" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cambios en esta Política</h2>
              <p className="text-gray-700 leading-relaxed">
                ChambaSegura se reserva el derecho de actualizar esta Política de Privacidad en cualquier 
                momento. Los cambios serán notificados a través de la Plataforma y, cuando sea posible, 
                mediante correo electrónico. Se recomienda al usuario revisar periódicamente esta página.
              </p>
            </section>



          </div>

          {/* Pie de página */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                Revisa también nuestros{' '}
                <Link href="/terminos" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Términos y Condiciones
                </Link>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>

      <InfoFooter />
    </div>
  );
}
