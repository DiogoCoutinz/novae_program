import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const TrainingModal = ({ training, isOpen, onClose }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    // Fetch audio when modal opens and recording URL exists
    if (isOpen && training?.gravacao_url && training.gravacao_url.includes('api.elevenlabs.io')) {
      fetchAudio();
    }
    
    // Cleanup blob URL when modal closes
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    };
  }, [isOpen, training?.gravacao_url]);

  const fetchAudio = async () => {
    setAudioLoading(true);
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const response = await fetch(training.gravacao_url, {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        console.error('Failed to fetch audio:', response.status);
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
    } finally {
      setAudioLoading(false);
    }
  };

  if (!training) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-700/50 max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-b border-slate-700/50 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-lg">
                    {training.cliente_nome?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white font-poppins">
                      Training Session Details
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {training.cliente_nome || 'Unknown Client'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-slate-700/50 hover:bg-slate-700 text-gray-400 hover:text-white transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                
                {/* Score Card */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Performance Score</div>
                      <div className="flex items-baseline space-x-3">
                        <span className="text-6xl font-bold text-emerald-400 font-poppins">
                          {training.score?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-3xl text-gray-500 font-light">/10</span>
                      </div>
                      <div className="mt-3 text-sm text-gray-400">
                        {formatDate(training.data_treino)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 font-semibold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>{training.tipo || 'Voice'}</span>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Summary */}
                {training.resumo && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white font-poppins">Summary</h3>
                    </div>
                    <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-700/50">
                      <p className="text-gray-300 leading-relaxed">{training.resumo}</p>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {training.feedback_geral && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white font-poppins">General Feedback</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
                      <p className="text-gray-300 leading-relaxed">{training.feedback_geral}</p>
                    </div>
                  </div>
                )}

                {/* Improvement Points */}
                {training.pontos_melhorar && training.pontos_melhorar.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white font-poppins">Areas to Improve</h3>
                    </div>
                    <div className="space-y-2">
                      {training.pontos_melhorar.map((ponto, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4 flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-yellow-400 font-semibold text-sm">{index + 1}</span>
                          </div>
                          <span className="text-gray-300">{ponto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recording Audio Player */}
                {training.gravacao_url && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white font-poppins">Call Recording</h3>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
                      {audioLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                          <span className="ml-3 text-gray-400">Loading audio...</span>
                        </div>
                      ) : audioUrl ? (
                        <audio 
                          controls 
                          className="w-full"
                          style={{
                            filter: 'invert(1) hue-rotate(180deg)',
                            borderRadius: '8px'
                          }}
                        >
                          <source src={audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400 mb-3">Audio recording available</p>
                          <a
                            href={training.gravacao_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg px-4 py-2 text-emerald-400 hover:text-emerald-300 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Open in ElevenLabs</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {training.transcript && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white font-poppins">Conversation Transcript</h3>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-5 max-h-80 overflow-y-auto">
                      {training.transcript.transcript && training.transcript.transcript.length > 0 ? (
                        <div className="space-y-4">
                          {training.transcript.transcript.map((message, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.role === 'user' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
                              }`}>
                                <svg className={`w-4 h-4 ${message.role === 'user' ? 'text-blue-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className={`text-sm font-semibold mb-1 ${message.role === 'user' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                  {message.role === 'user' ? 'You' : 'AI Client'}
                                </div>
                                <p className="text-gray-300 leading-relaxed">{message.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <p className="text-gray-400">Transcript not available yet</p>
                          <p className="text-gray-500 text-sm mt-1">The conversation may still be processing</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="border-t border-slate-700/50 px-8 py-5 bg-[#0f172a] flex items-center justify-end">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TrainingModal;

