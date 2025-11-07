import { motion } from 'framer-motion';
import { useState } from 'react';
import TrainingModal from './TrainingModal';

const TrainingsTable = ({ trainings }) => {
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (training) => {
    setSelectedTraining(training);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTraining(null), 300);
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <motion.div
        className="bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
      <div className="px-6 py-5 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-white font-poppins">Recent Training Sessions</h2>
        <p className="text-sm text-gray-400 mt-1">Your latest performance reviews</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0f172a] border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Summary
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-slate-700/50"
          >
            {trainings && trainings.length > 0 ? (
              trainings.map((training, index) => (
                <motion.tr
                  key={training.id || index}
                  variants={rowVariants}
                  onClick={() => handleRowClick(training)}
                  className="hover:bg-emerald-900/10 transition-colors duration-200 cursor-pointer"
                  whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm mr-3">
                        {training.cliente_nome?.charAt(0) || '?'}
                      </div>
                      <span className="text-white font-medium">{training.cliente_nome || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-emerald-400 font-poppins">
                        {training.score?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-gray-500 ml-1">/10</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300 text-sm max-w-md line-clamp-2">
                      {training.resumo || 'No summary available'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                    {formatDate(training.data_treino)}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-lg">No training sessions yet</p>
                    <p className="text-gray-500 text-sm mt-1">Start your first training to see results here</p>
                  </div>
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
      </motion.div>

      {/* Modal */}
      <TrainingModal
        training={selectedTraining}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default TrainingsTable;

