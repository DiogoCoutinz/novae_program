import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const ComercialOnboarding = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    experiencia_anos: '',
    estilo_abordagem: '',
    pontos_fortes: '',
    pontos_fracos: '',
    estrategia_vendas: '',
    tipo_clientes_alvo: '',
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email) {
      setSubmitStatus({ type: 'error', message: 'Nome e email são obrigatórios' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const dataToInsert = {
        ...formData,
        experiencia_anos: formData.experiencia_anos ? parseInt(formData.experiencia_anos) : null,
      };

      const { error } = await supabase
        .from('comerciais')
        .insert([dataToInsert]);

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: '✅ Perfil criado com sucesso!'
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error creating profile:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message.includes('duplicate') 
          ? 'Este email já está registado' 
          : 'Erro ao criar perfil. Tenta novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      {/* Mouse spotlight effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.08), transparent 80%)`
        }}
      />
      
      {/* Diagonal stripes pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 0, transparent 50%)',
        backgroundSize: '20px 20px'
      }} />
      
      {/* Subtle gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-emerald-950/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-emerald-950/10 to-transparent" />

      {/* Top Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
            <span className="text-white font-bold text-lg">CC</span>
          </div>
          <span className="text-2xl font-bold text-white font-poppins">CallCoach AI</span>
        </motion.div>

        <motion.button
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all font-medium"
        >
          Dashboard →
        </motion.button>
      </nav>

      {/* Form Section */}
      <div className="relative z-10 py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6 px-5 py-2 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium"
            >
              Setup Comercial
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
              Conta-nos sobre ti
            </h1>
            <p className="text-lg text-gray-400">
              Estas respostas ajudam a AI a dar-te feedback personalizado
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 md:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="e.g., Diogo Costa"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., diogo@empresa.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              {/* Experiência */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Anos de Experiência em Vendas
                </label>
                <input
                  type="number"
                  name="experiencia_anos"
                  value={formData.experiencia_anos}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Estilo de Abordagem */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Estilo de Abordagem
                </label>
                <textarea
                  name="estilo_abordagem"
                  value={formData.estilo_abordagem}
                  onChange={handleChange}
                  placeholder="e.g., Consultivo, direto, relacional, técnico..."
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Pontos Fortes */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Pontos Fortes
                </label>
                <textarea
                  name="pontos_fortes"
                  value={formData.pontos_fortes}
                  onChange={handleChange}
                  placeholder="e.g., Escuta ativa, gestão de objeções, apresentações técnicas..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Pontos Fracos */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Áreas a Melhorar
                </label>
                <textarea
                  name="pontos_fracos"
                  value={formData.pontos_fracos}
                  onChange={handleChange}
                  placeholder="e.g., Negociação de preços, follow-ups, cold calling..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Estratégia de Vendas */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Estratégia de Vendas
                </label>
                <textarea
                  name="estrategia_vendas"
                  value={formData.estrategia_vendas}
                  onChange={handleChange}
                  placeholder="e.g., SPIN Selling, Challenger Sale, MEDDIC, Solution Selling..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Tipo de Clientes Alvo */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tipo de Clientes que Vendes
                </label>
                <textarea
                  name="tipo_clientes_alvo"
                  value={formData.tipo_clientes_alvo}
                  onChange={handleChange}
                  placeholder="e.g., PMEs tecnológicas, Enterprise B2B, Startups SaaS..."
                  rows="2"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Status message */}
              {submitStatus && (
                <div className={`p-4 rounded-xl ${
                  submitStatus.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>A criar perfil...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Criar Perfil</span>
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                Estas informações são usadas apenas para personalizar o teu treino com IA
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center">
        <p className="text-gray-500 text-sm">© 2025 CallCoach AI</p>
        <p className="text-emerald-500 font-semibold text-sm mt-1">Practice → Performance → Revenue</p>
      </footer>
    </div>
  );
};

export default ComercialOnboarding;

