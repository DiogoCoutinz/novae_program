import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import Header from './components/dashboard/Header';
import StatsGrid from './components/dashboard/StatsGrid';
import TrainingsTable from './components/dashboard/TrainingsTable';
import TrainingSimulator from './components/dashboard/TrainingSimulator';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [comercialData, setComercialData] = useState(null);
  const [stats, setStats] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const COMERCIAL_ID = 1; // Demo user

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch comercial info
      const { data: comercial, error: comercialError } = await supabase
        .from('comerciais')
        .select('*')
        .eq('id', COMERCIAL_ID)
        .single();

      if (comercialError) throw comercialError;
      setComercialData(comercial);

      // Fetch trainings with client names
      const { data: treinosData, error: treinosError } = await supabase
        .from('treinos')
        .select('*')
        .eq('comercial_id', COMERCIAL_ID)
        .order('data_treino', { ascending: false })
        .limit(10);

      if (treinosError) throw treinosError;

      // Fetch all clients to map names
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nome');

      // Create client lookup map
      const clientMap = {};
      if (clientesData) {
        clientesData.forEach(c => {
          clientMap[c.id] = c.nome;
        });
      }

      // Transform data to include client name at top level
      const transformedTrainings = (treinosData || []).map(t => ({
        ...t,
        cliente_nome: clientMap[t.cliente_id] || 'Unknown Client'
      }));
      setTrainings(transformedTrainings);

      // Calculate stats
      if (treinosData && treinosData.length > 0) {
        const scores = treinosData.map(t => t.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maxScore = Math.max(...scores);

        // Get most common weak point
        const weakPointsArray = treinosData
          .map(t => t.pontos_melhorar)
          .filter(Boolean)
          .flat();
        
        const weakPointCounts = {};
        weakPointsArray.forEach(point => {
          weakPointCounts[point] = (weakPointCounts[point] || 0) + 1;
        });

        const mostCommonWeakPoint = Object.entries(weakPointCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        // Count unique clients trained (clients with at least one treino)
        const uniqueClientIds = [...new Set(treinosData.map(t => t.cliente_id).filter(Boolean))];
        const clientCount = uniqueClientIds.length;

        setStats({
          averageScore: avgScore,
          bestScore: maxScore,
          weakPoints: mostCommonWeakPoint,
          totalClients: clientCount || 0
        });
      } else {
        setStats({
          averageScore: 0,
          bestScore: 0,
          weakPoints: 'No data',
          totalClients: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setComercialData({ nome: 'User', email: 'user@example.com' });
      setStats({
        averageScore: 0,
        bestScore: 0,
        weakPoints: 'No data',
        totalClients: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'simulator', label: 'Training Simulator' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#1e293b] border-b border-slate-700/50 backdrop-blur-lg bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <h1 className="text-xl font-bold text-white font-poppins">CallCoach AI</h1>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center space-x-2 bg-[#0f172a] rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all duration-300 relative
                    ${activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300'
                    }
                  `}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-emerald-500 rounded-lg"
                      layoutId="activeTab"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* User Avatar */}
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold shadow-lg cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {comercialData ? getInitials(comercialData.nome) : 'U'}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Header
                  comercialName={comercialData?.nome || 'User'}
                  comercialInitials={getInitials(comercialData?.nome)}
                />
                <StatsGrid stats={stats} />
                <TrainingsTable trainings={trainings} />
              </motion.div>
            ) : (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TrainingSimulator />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 CallCoach AI
          </p>
          <p className="text-emerald-500 font-semibold text-sm mt-1 tracking-wide">
            Train. Improve. Close.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

