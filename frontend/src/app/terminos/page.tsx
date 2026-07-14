"use client";

import InfoNavigation from "../components/InfoNavigation";
import InfoFooter from "../components/InfoFooter";
import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      <InfoNavigation />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-bold mb-4 uppercase tracking-wider">
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Última actualización: <span className="font-semibold text-gray-700">13 de julio de 2026</span>
            </p>
          </div>

          {/* Barra de navegación interna */}
          <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-10">
            <nav className="flex gap-6 text-sm font-medium text-gray-500 overflow-x-auto">
              <a href="#aceptacion" className="hover:text-blue-600 transition-colors whitespace-nowrap">Aceptación</a>
              <a href="#definiciones" className="hover:text-blue-600 transition-colors whitespace-nowrap">Definiciones</a>
              <a href="#naturaleza" className="hover:text-blue-600 transition-colors whitespace-nowrap">Naturaleza</a>
              <a href="#registro" className="hover:text-blue-600 transition-colors whitespace-nowrap">Registro</a>
              <a href="#postulacion" className="hover:text-blue-600 transition-colors whitespace-nowrap">Postulación</a>
              <a href="#obligaciones" className="hover:text-blue-600 transition-colors whitespace-nowrap">Obligaciones</a>
              <a href="#pagos" className="hover:text-blue-600 transition-colors whitespace-nowrap">Pagos</a>
              <a href="#ejecucion" className="hover:text-blue-600 transition-colors whitespace-nowrap">Ejecución</a>
              <a href="#responsabilidad" className="hover:text-blue-600 transition-colors whitespace-nowrap">Responsabilidad</a>
              <a href="#disputas" className="hover:text-blue-600 transition-colors whitespace-nowrap">Disputas</a>
              <a href="#privacidad" className="hover:text-blue-600 transition-colors whitespace-nowrap">Privacidad</a>
              <a href="#propiedad" className="hover:text-blue-600 transition-colors whitespace-nowrap">Propiedad Intelectual</a>
              <a href="#terminacion" className="hover:text-blue-600 transition-colors whitespace-nowrap">Terminación</a>
              <a href="#legislacion" className="hover:text-blue-600 transition-colors whitespace-nowrap">Legislación</a>
            </nav>
          </div>

          {/* Contenido legal */}
          <div className="prose prose-gray max-w-none space-y-10">

            <section id="aceptacion">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  Al acceder, navegar o utilizar la plataforma <strong>ChambaSegura</strong> (en adelante, &laquo;la Plataforma&raquo;), usted manifiesta
                  haber leído, entendido y aceptado expresamente los presentes <strong>Términos y Condiciones de Uso</strong>, así como nuestra
                  <Link href="/privacidad" className="text-blue-600 hover:text-blue-700 font-semibold"> Política de Privacidad</Link>.
                  Si no está de acuerdo con alguno de estos términos, deberá abstenerse de utilizar la Plataforma.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChambaSegura se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones
                entrarán en vigor inmediatamente después de su publicación en la Plataforma. Es responsabilidad del
                usuario revisar periódicamente esta página para estar al tanto de cualquier cambio.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    De conformidad con la <strong>Ley sobre Mensajes de Datos y Firmas Electrónicas</strong>, el acto de pulsar el botón &laquo;Aceptar Términos y Condiciones&raquo; al momento del registro o al contratar un servicio constituye una firma electrónica válida y el consentimiento expreso y vinculante de todo lo establecido en este documento.
                  </p>
                </div>
              </div>
            </section>

            <section id="definiciones" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definiciones</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">Plataforma</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">El sitio web y la aplicación móvil <strong>ChambaSegura</strong>, incluyendo todas sus funcionalidades, herramientas y servicios.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">Usuario / Contratante</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">Toda persona natural o jurídica que se registre en la Plataforma para solicitar o contratar servicios técnicos.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">Técnico / Prestador</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">Toda persona natural debidamente registrada que ofrece servicios técnicos a través de la Plataforma.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">Servicio</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">Cualquier actividad técnica ofrecida por un Prestador y solicitada por un Contratante a través de la Plataforma.</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">Contrato</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">El acuerdo vinculante entre el Contratante y el Prestador para la ejecución de un Servicio específico.</p>
                </div>
              </div>
            </section>

            <section id="naturaleza" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Naturaleza del Servicio</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChambaSegura actúa única y exclusivamente como un <strong>intermediario tecnológico</strong> que conecta a personas
                que requieren una solución o reparación en su hogar o residencia (Clientes o Contratantes) con
                profesionales técnicos u oficios independientes (Prestadores de Servicios, tales como carpinteros,
                plomeros, electricistas, entre otros). La Plataforma no ejecuta directamente los servicios,
                sino que facilita el contacto, la contratación y el procesamiento de pagos.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Nota legal</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      La plataforma <strong>no mantiene ninguna relación laboral</strong>, de subordinación o de dependencia
                      con los Prestadores de Servicios. Cada prestador actúa de forma autónoma e independiente.
                      La relación contractual se establece directamente entre el Contratante y el Prestador.
                      ChambaSegura no es empleador ni contratista de los técnicos registrados.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="registro" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Registro y Verificación de Perfiles</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para acceder a las funcionalidades de la Plataforma, el usuario deberá crear una cuenta proporcionando
                información veraz, completa y actualizada, incluyendo como mínimo: nombre, apellido, documento de
                identidad, teléfono y correo electrónico. El usuario es el único responsable de mantener la
                confidencialidad de sus credenciales de acceso.
              </p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span>El registro es gratuito y está dirigido a mayores de 18 años.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span>La cuenta es personal e intransferible. El usuario no podrá cederla a terceros.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </span>
                  <span>El usuario se compromete a notificar inmediatamente cualquier uso no autorizado de su cuenta.</span>
                </li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      <strong>Prestadores de Servicios:</strong> Tienen la obligación de publicar información verídica sobre
                      sus habilidades, oficios y galería de trabajos realizados. La plataforma se reserva el derecho
                      de <strong>suspender perfiles</strong> que utilicen imágenes falsas o que no les pertenezcan.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="postulacion" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Proceso de Postulación y Contratación</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-700 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Publicación del requerimiento</h3>
                    <p className="text-sm leading-relaxed">El Cliente publica en la Plataforma un requerimiento o problema específico que necesite resolver, describiendo el servicio solicitado.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-700 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Postulación de Prestadores</h3>
                    <p className="text-sm leading-relaxed">Los Prestadores de Servicios calificados podrán postularse a la solicitud ofreciendo su presupuesto y tiempo estimado.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-700 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Formación del contrato</h3>
                    <p className="text-sm leading-relaxed">El contrato digital entre las partes se perfecciona en el momento en que el Cliente acepta expresamente la postulación del Prestador de Servicios elegido.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="obligaciones" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Obligaciones de las Partes</h2>
              <h3 className="font-bold text-gray-900 mb-3">6.1 Obligaciones del Contratante</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Proporcionar información clara y veraz sobre el servicio solicitado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Garantizar un entorno seguro y accesible para la ejecución del servicio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Realizar el pago acordado a través de los métodos habilitados en la Plataforma.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Calificar y evaluar al técnico una vez finalizado el servicio.</span>
                </li>
              </ul>

              <h3 className="font-bold text-gray-900 mb-3">6.2 Obligaciones del Prestador (Técnico)</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Ejecutar el servicio contratado con diligencia, profesionalismo y conforme a lo acordado.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Cumplir con todas las leyes y regulaciones aplicables en la República Bolivariana de Venezuela.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Publicar información verídica sobre sus habilidades y oficios, y mantener actualizados sus datos de perfil.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Asistir puntualmente a las citas y servicios acordados.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Contar con las herramientas, permisos y habilitaciones necesarias para prestar el servicio.</span>
                </li>
              </ul>

              <h3 className="font-bold text-gray-900 mb-3">6.3 Obligaciones de ChambaSegura</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Mantener la Plataforma operativa y segura, realizando esfuerzos comercialmente razonables para garantizar su disponibilidad.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Facilitar el procesamiento de pagos y administrar el sistema de depósito en garantía (escrow).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Proporcionar un canal de soporte y resolución de controversias.</span>
                </li>
              </ul>
            </section>

            <section id="pagos" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Pasarela de Pagos y Sistema de Depósito en Garantía (Escrow)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para garantizar la seguridad y transparencia de la transacción, la plataforma opera bajo el siguiente
                esquema financiero:
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-700 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Pago Anticipado del 100%</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">Una vez que el Cliente acepte la postulación del Prestador, deberá realizar el pago equivalente al 100% del costo total del servicio a través de la pasarela de pagos integrada en la aplicación.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-700 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Retención Temporal de Fondos</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">La plataforma recibirá el dinero y lo retendrá de forma segura en una cuenta de garantía. El dinero no será entregado al Prestador de Servicios en este momento.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-700 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Liberación del Dinero</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">El dinero retenido será transferido a la cuenta del Prestador de Servicios únicamente cuando <strong>ambas partes</strong> (Cliente y Prestador) confirmen de manera obligatoria dentro de la aplicación que el trabajo ha sido ejecutado y finalizado correctamente.</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg shrink-0">⚠️</span>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    Los pagos realizados fuera de la Plataforma no están cubiertos por el sistema de depósito en
                    garantía (escrow), ni por nuestras políticas de protección o resolución de disputas.
                  </p>
                </div>
              </div>
            </section>

            <section id="ejecucion" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Ejecución del Servicio y Responsabilidad Domiciliaria</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                El Prestador de Servicios acudirá a la residencia o lugar indicado por el Cliente para realizar
                las labores acordadas. La plataforma no se hace responsable por daños materiales, pérdidas o la
                conducta de ninguna de las partes durante la ejecución del trabajo en el domicilio, siendo esto
                responsabilidad civil exclusiva de los individuos involucrados.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Se recomienda a ambas partes documentar el estado del lugar antes y después del servicio, y
                    mantener toda comunicación a través del chat interno de la aplicación como respaldo.
                  </p>
                </div>
              </div>
            </section>

            <section id="responsabilidad" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                En la medida máxima permitida por la legislación de la República Bolivariana de Venezuela,
                ChambaSegura no será responsable por:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Daños directos o indirectos derivados de la ejecución o falta de ejecución de un servicio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Actos u omisiones de los técnicos registrados en la Plataforma.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Interrupciones del servicio por causas de fuerza mayor o caso fortuito.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-gray-500">•</span>
                  <span>Pérdida de datos o daños causados por virus informáticos o accesos no autorizados.</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                ChambaSegura pone a disposición de los usuarios un sistema de calificaciones y reseñas para
                fomentar la confianza y transparencia en la comunidad.
              </p>
            </section>

            <section id="disputas" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Mecanismo de Resolución de Disputas</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                En caso de que el Prestador afirme haber terminado el trabajo, pero el Cliente se niegue a confirmar
                la liberación del dinero (o viceversa), se activará el siguiente protocolo:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-orange-700 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Reporte de Disputa</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">Cualquiera de las partes podrá reportar una Disputa a través del sistema de soporte de la Plataforma.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-orange-700 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Congelamiento de Fondos</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">La plataforma congelará los fondos retenidos y otorgará un lapso para que ambas partes presenten evidencias (mensajes del chat interno, fotografías del estado del trabajo, etc.).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-orange-700 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Decisión Final</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">El equipo técnico de la plataforma tomará una decisión definitiva basándose en las pruebas, procediendo a la devolución total o parcial del dinero al Cliente, o a la liberación total o parcial al Prestador.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="privacidad" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacidad y Protección de Datos</h2>
              <p className="text-gray-700 leading-relaxed">
                ChambaSegura cumple con lo establecido en la <strong>Constitución de la República Bolivariana de Venezuela</strong>
                (artículo 60), la <strong>Ley de Infogobierno</strong> y las disposiciones aplicables en materia de
                protección de datos personales. Para más información, consulte nuestra
                <Link href="/privacidad" className="text-blue-600 hover:text-blue-700 font-semibold"> Política de Privacidad</Link>.
              </p>
            </section>

            <section id="propiedad" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Propiedad Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo su diseño,
                código fuente, logotipos, marcas y contenidos, pertenecen exclusivamente a ChambaSegura
                o a sus licenciantes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Queda prohibida la reproducción, distribución, modificación o uso no autorizado de cualquier
                contenido de la Plataforma sin el consentimiento previo y por escrito de ChambaSegura.
              </p>
            </section>

            <section id="terminacion" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Terminación</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChambaSegura se reserva el derecho de suspender o terminar el acceso de cualquier usuario
                que incumpla estos términos, realice actividades fraudulentas, o que, a nuestro criterio,
                represente un riesgo para la comunidad.
              </p>
              <p className="text-gray-700 leading-relaxed">
                El usuario puede eliminar su cuenta en cualquier momento desde la sección de perfil.
                Al terminar la relación, el usuario cesará el uso de la Plataforma, pero las disposiciones
                de estos términos que por su naturaleza deban sobrevivir, continuarán vigentes.
              </p>
            </section>

            <section id="legislacion" className="pt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Legislación Aplicable y Jurisdicción</h2>
              <div className="bg-gray-900 text-white rounded-2xl p-6 mb-4">
                <p className="leading-relaxed text-gray-200">
                  Estos Términos y Condiciones se rigen por las leyes de la <strong>República Bolivariana de Venezuela</strong>.
                  Cualquier controversia que surja en relación con la Plataforma será sometida a la
                  jurisdicción de los tribunales competentes de la ciudad de <strong>Caracas</strong>, con renuncia
                  expresa a cualquier otro fuero o jurisdicción que pudiera corresponderles.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Se aplicarán supletoriamente las disposiciones del <strong>Código Civil Venezolano</strong>, el
                <strong>Código de Comercio</strong>, la <strong>Ley de Protección al Consumidor</strong> y la
                <strong>Ley sobre Mensajes de Datos y Firmas Electrónicas</strong> (Decreto Ley N° 1.204).
              </p>
            </section>

          </div>

          {/* Pie de página legal */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                Si tienes preguntas sobre estos términos, puedes consultar nuestro{' '}
                <Link href="/ayuda" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Centro de Ayuda
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
