import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex flex-col"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 font-poppins leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Pronto para transformar a tua equipa comercial?
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-emerald-50 mb-12 md:mb-16 font-light leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Começa hoje a treinar com IA e aumenta as tuas taxas de fecho.
          </motion.p>

          <motion.button
            className="group px-12 py-6 bg-white text-emerald-700 rounded-full text-xl md:text-2xl font-semibold font-poppins shadow-2xl transition-all duration-300 hover:bg-emerald-50"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Agendar Demonstração
          </motion.button>

          {/* Social proof or additional info */}
          <motion.div
            className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 font-poppins">15min</div>
              <div className="text-emerald-100 font-light">Treino rápido</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 font-poppins">+40%</div>
              <div className="text-emerald-100 font-light">Taxa de conversão</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 font-poppins">24/7</div>
              <div className="text-emerald-100 font-light">Disponibilidade</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 py-8 text-center text-white border-t border-emerald-400/20"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <p className="text-sm md:text-base font-light mb-2">
          © 2025 CallCoach AI
        </p>
        <p className="text-emerald-100 font-semibold tracking-wide">
          Treina. Melhora. Fecha.
        </p>
      </motion.footer>
    </section>
  );
};

export default CTASection;

