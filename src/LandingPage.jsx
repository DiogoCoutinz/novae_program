import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const LandingPage = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    
    if (!companyName || !contactName || !email) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    // Mostra sucesso IMEDIATAMENTE para o cliente
    setSubmitStatus({ 
      type: 'success', 
      message: '✅ Thanks! We\'ll be in touch soon.' 
    });
    
    // Limpa o form imediatamente
    const submittedCompany = companyName;
    const submittedContact = contactName;
    const submittedEmail = email;
    
    setCompanyName('');
    setContactName('');
    setEmail('');

    // Limpa a mensagem depois de 3 segundos
    setTimeout(() => {
      setSubmitStatus(null);
    }, 3000);

    // Pesquisa e insere em background (cliente não vê nada)
    (async () => {
      try {
        console.log('🔍 Starting background research for:', submittedCompany);
        
        // Pesquisa a empresa com a AI
        const { data: researchData, error: researchError } = await supabase.functions.invoke('research-company', {
          body: { companyName: submittedCompany, companyWebsite: '' }
        });

        console.log('📊 Research response:', researchData);

        if (researchError) {
          console.error('❌ Research error:', researchError);
          throw researchError;
        }

        // Edge function retorna: { success: true, data: {...} }
        const aiData = researchData?.data;

        if (!aiData) {
          console.error('❌ No data from research');
          throw new Error('No data returned from research');
        }

        // Cria cliente com dados pesquisados
        const clientData = {
          nome: submittedContact,
          empresa: submittedCompany,
          email: submittedEmail,
          setor: aiData.setor || 'tecnologia',
          tamanho_equipa: aiData.tamanho_equipa || 10,
          objetivo: aiData.objetivo || 'Melhorar processos de vendas',
          orcamento_est: aiData.orcamento_est || '10k-20k',
          urgencia: aiData.urgencia || 'média',
          experiencia_ia: aiData.experiencia_ia || 'básica',
        };

        console.log('💾 Inserting client with data:', clientData);

        const { error: insertError } = await supabase
          .from('clientes')
          .insert([clientData]);

        if (insertError) {
          console.error('❌ Error inserting client:', insertError);
          throw insertError;
        }
        
        console.log('✅ Client added successfully with AI research!');

      } catch (error) {
        console.error('❌ Background process error:', error);
        
        // Se falhar completamente, insere com dados básicos como fallback
        try {
          console.log('🔄 Fallback: inserting with default data');
          const fallbackData = {
            nome: submittedContact,
            empresa: submittedCompany,
            email: submittedEmail,
            setor: 'tecnologia',
            tamanho_equipa: 10,
            objetivo: 'Melhorar processos de vendas',
            orcamento_est: '10k-20k',
            urgencia: 'média',
            experiencia_ia: 'básica',
          };
          
          await supabase.from('clientes').insert([fallbackData]);
          console.log('✅ Client added with default data');
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
    })();
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
      
      {/* Animated noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
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

      {/* Hero Section - Split with animated visualization */}
      <div className="relative z-10 min-h-[90vh] flex items-center px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6 px-5 py-2 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium"
            >
              Voice AI · Real Practice · Real Results
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 font-poppins leading-tight"
            >
              Practice calls.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Win deals.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-8 font-light leading-relaxed"
            >
              Talk to AI prospects that challenge you. Get feedback that matters.
              Stop losing deals to better-prepared competitors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-lg font-semibold shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105"
              >
                Start Practicing
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-full text-lg font-semibold border border-white/20 hover:bg-white/10 transition-all duration-300">
                See How It Works
              </button>
            </motion.div>
          </motion.div>

          {/* Right - Animated Performance Dashboard Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main card with stats */}
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-gray-400 text-sm">Performance</div>
                  <div className="text-white text-2xl font-bold font-poppins">Live Results</div>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50"></div>
              </div>

              {/* Animated bar chart */}
              <div className="space-y-4 mb-8">
                {[
                  { label: 'Close Rate', value: 85, color: 'emerald', delay: 0.5 },
                  { label: 'Confidence', value: 92, color: 'emerald', delay: 0.7 },
                  { label: 'Response Time', value: 78, color: 'emerald', delay: 0.9 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">{item.label}</span>
                      <span className="text-white font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1.5, delay: item.delay, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full shadow-lg shadow-${item.color}-500/50`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4"
                >
                  <div className="text-emerald-400 text-3xl font-bold font-poppins mb-1">+40%</div>
                  <div className="text-gray-400 text-xs">Conversion ↑</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4"
                >
                  <div className="text-emerald-400 text-3xl font-bold font-poppins mb-1">15min</div>
                  <div className="text-gray-400 text-xs">Avg. Training</div>
                </motion.div>
              </div>

              {/* Floating indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="mt-6 flex items-center space-x-2 text-emerald-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium">+23% this week</span>
              </motion.div>
            </div>

            {/* Floating accent cards */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.8 }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-2xl shadow-emerald-500/30"
            >
              <div className="text-white text-2xl font-bold font-poppins">24/7</div>
              <div className="text-emerald-100 text-xs">AI Available</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 2 }}
              className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-white text-sm font-semibold">Real-time feedback</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Results Section - Simpler, direct */}
      <div className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
              The Problem is Obvious
            </h2>
            <p className="text-xl text-gray-400">Most reps wing it. Top performers practice. Simple as that.</p>
          </motion.div>

          {/* Two column impact */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-sm font-medium mb-4">
                  Without AI Training
                </div>
                <div className="space-y-3">
                  {['Unprepared meetings', 'Confused pitches', 'Lost opportunities', 'Low confidence'].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-gray-400">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-medium mb-4">
                  With CallCoach AI
                </div>
                <div className="space-y-3">
                  {['AI-coached scenarios', 'Instant feedback', '+40% close rate', 'Peak confidence'].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Lead Generation Form */}
      <div className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
                New Prospect?
              </h2>
              <p className="text-lg text-gray-400">
                Drop their info. We'll research the company and build a practice scenario.
              </p>
            </div>

            <form onSubmit={handleSubmitLead} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., TechCorp"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g., John Silva"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., john@techcorp.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              {submitStatus && (
                <div className={`p-4 rounded-xl ${
                  submitStatus.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isResearching}
                className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isResearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add & Build Scenario</span>
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                AI researches the company automatically · Takes ~10 seconds
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

export default LandingPage;
