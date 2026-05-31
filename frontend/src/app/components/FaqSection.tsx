import { useState } from "react";

const faqs = [
  {
    q: "¿Cómo funciona el pago en garantía?",
    a: "La aplicación retiene tu pago de forma segura. El dinero solo se libera al técnico una vez que tú confirmas que el trabajo se ha completado satisfactoriamente.",
  },
  {
    q: "¿Cómo verifican a los técnicos?",
    a: "Realizamos una verificación estricta de antecedentes penales, referencias laborales y pruebas de habilidades técnicas antes de permitirles ofrecer servicios.",
  },
  {
    q: "¿Qué pasa si el trabajo no queda bien?",
    a: "Contamos con un sistema de resolución de disputas. Si el trabajo no cumple con lo acordado, nuestro equipo interviene para asegurar una solución justa o el reembolso.",
  },
  {
    q: "¿Tienen tarifas fijas?",
    a: "Establecemos tarifas base transparentes por tipo de avería para evitar la especulación y asegurar que pagues un precio justo y competitivo.",
  },
];

export default function FaqSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Todo lo que necesitas saber sobre el funcionamiento del ecosistema.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 sm:px-8 py-5 text-left flex justify-between items-center bg-white hover:bg-gray-50/80 transition-colors"
              >
                <span className="font-bold text-gray-900 text-sm sm:text-base pr-4">
                  {faq.q}
                </span>
                <span
                  className={`text-xl font-light text-gray-400 transform transition-transform duration-300 shrink-0 ${activeFaq === index ? "rotate-45 text-blue-600" : ""}`}
                >
                  ＋
                </span>
              </button>
              {activeFaq === index && (
                <div className="px-6 sm:px-8 pb-5 bg-white text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-50 pt-3 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
