import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from './supabaseClient';

const LandingPage = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    
    if (!companyName || !contactName || !email) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setIsResearching(true);
    setSubmitStatus(null);

    try {
      // Call Edge Function to research company
      const { data: researchData, error: researchError } = await supabase.functions.invoke('research-company', {
        body: { companyName, companyWebsite: '' }
      });

      if (researchError) {
        console.error('Research error:', researchError);
        // Continue even if research fails
      }

      // Create client with researched data or defaults
      const clientData = {
        nome: contactName,
        empresa: companyName,
        email: email,
        setor: researchData?.data?.setor || 'tecnologia',
        tamanho_equipa: researchData?.data?.tamanho_equipa || 10,
        objetivo: researchData?.data?.objetivo || 'Melhorar processos de vendas',
        orcamento_est: researchData?.data?.orcamento_est || '10k-20k',
        urgencia: researchData?.data?.urgencia || 'média',
        experiencia_ia: researchData?.data?.experiencia_ia || 'básica',
      };

      const { error: insertError } = await supabase
        .from('clientes')
        .insert([clientData]);

      if (insertError) throw insertError;

      setSubmitStatus({ 
        type: 'success', 
        message: '✅ Lead added! AI research completed. Check your dashboard!' 
      });
      
      // Clear form
      setCompanyName('');
      setContactName('');
      setEmail('');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to add lead. Please try again.' 
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

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
              ✨ AI-Powered Sales Training
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 font-poppins leading-tight"
            >
              Train Smarter.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Close Faster.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 mb-8 font-light leading-relaxed"
            >
              AI voice coaching that transforms performance.
              Practice real scenarios, get instant feedback, increase conversion.
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
                Start Training Now
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              
              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-full text-lg font-semibold border border-white/20 hover:bg-white/10 transition-all duration-300">
                Watch Demo
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
              Real Results. Real Fast.
            </h2>
            <p className="text-xl text-gray-400">80% of sales reps fail due to poor preparation. We fix that.</p>
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
                Got a New Lead?
              </h2>
              <p className="text-lg text-gray-400">
                Add them here. Our AI will research the company and prep you for the meeting.
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
                    <span>Researching Company...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Lead & Start Prep</span>
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                🤖 AI will research the company and create a training scenario automatically
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center">
        <p className="text-gray-500 text-sm">© 2025 CallCoach AI</p>
        <p className="text-emerald-500 font-semibold text-sm mt-1">Train. Improve. Close.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
