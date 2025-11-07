import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const ProblemSolution = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section
      id="problema-solucao"
      ref={ref}
      className="min-h-screen w-full bg-white py-20 md:py-32 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 font-poppins">
            O problema que resolvemos
          </h2>
          <div className="w-32 h-1 bg-emerald-500 mx-auto"></div>
        </motion.div>

        {/* Two column layout */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left - Problem */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 font-poppins">
                  O Problema
                </h3>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                  80% dos comerciais falham não por falta de talento, mas por falta de preparação.
                  Reuniões mal estruturadas, argumentos confusos e follow-ups fracos custam milhares em oportunidades perdidas.
                </p>
              </div>
            </div>

            {/* Icons/Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-red-500 font-poppins">80%</div>
                <div className="text-sm text-gray-600 mt-1">Falham</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-red-500 font-poppins">€€€</div>
                <div className="text-sm text-gray-600 mt-1">Perdidos</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-red-500 font-poppins">0</div>
                <div className="text-sm text-gray-600 mt-1">Preparação</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Solution */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300 rounded-full filter blur-3xl opacity-30 -ml-20 -mb-20"></div>

            <div className="relative z-10">
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 font-poppins">
                  A Solução
                </h3>
              </div>

              <p className="text-lg md:text-xl text-emerald-50 leading-relaxed font-light mb-6">
                O CallCoach AI prepara cada comercial antes da reunião.
                Em 15 minutos de treino, simula perguntas reais, avalia performance e dá feedback personalizado —
                transformando cada reunião numa oportunidade ganha.
              </p>

              {/* Features */}
              <div className="space-y-3">
                {[
                  'Simulação de reuniões reais com IA',
                  'Feedback personalizado em tempo real',
                  'Análise de performance detalhada',
                  'Treino adaptado ao teu perfil'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-emerald-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;

